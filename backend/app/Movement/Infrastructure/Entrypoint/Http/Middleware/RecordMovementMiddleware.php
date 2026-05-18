<?php

namespace App\Movement\Infrastructure\Entrypoint\Http\Middleware;

use App\Shared\Infrastructure\Services\MovementLogger;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordMovementMiddleware
{
    public function __construct(
        private MovementLogger $logger,
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only record successful mutating requests
        if ($response->isSuccessful() && in_array($request->method(), ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            $this->record($request);
        }

        return $response;
    }

    private function record(Request $request): void
    {
        $action = $this->determineAction($request);
        
        // We skip logging the logging itself or login or GETs
        if ($action === 'login' || str_contains($request->path(), 'movements')) {
            return;
        }

        $description = $this->generateHumanDescription($request);
        $customUser = $this->resolveWorker($request);

        $this->logger->log(
            $action,
            $description,
            $this->determineResourceType($request),
            $this->determineResourceId($request),
            $this->extractSimplifiedChanges($request),
            $customUser
        );
    }

    private function resolveWorker(Request $request): ?array
    {
        // Many TPV actions send the worker UUID in the request body
        $userUuid = $request->input('user_uuid') ?? $request->input('opened_by_user_uuid');
        
        if (!$userUuid) {
            return null;
        }

        try {
            $worker = $this->userRepository->findById(Uuid::create($userUuid));
            if ($worker) {
                return [
                    'id' => null, // We don't have the numeric ID here easily, but name/email is what matters
                    'name' => $worker->name(),
                    'email' => $worker->email()->value(),
                    'restaurant_id' => $worker->restaurantId()->value()
                ];
            }
        } catch (\Exception $e) {
            // Ignore resolution errors
        }

        return null;
    }

    private function determineAction(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        
        $parts = explode('/', trim($path, '/'));
        $resource = end($parts);
        if (is_numeric($resource) || strlen($resource) > 20) { // Probably an ID
            $resource = $parts[count($parts) - 2] ?? 'resource';
        }

        return strtolower($method . '_' . $resource);
    }

    private function determineResourceType(Request $request): ?string
    {
        $path = $request->path();
        $parts = explode('/', trim($path, '/'));
        foreach ($parts as $part) {
            if (in_array($part, ['products', 'orders', 'sales', 'users', 'families', 'tables', 'taxes', 'zones'])) {
                return rtrim($part, 's');
            }
        }
        return null;
    }

    private function determineResourceId(Request $request): ?string
    {
        $path = $request->path();
        $parts = explode('/', trim($path, '/'));
        $last = end($parts);
        return (is_numeric($last) || strlen($last) > 20) ? $last : null;
    }

    private function extractSimplifiedChanges(Request $request): array
    {
        $data = $request->except(['password', 'password_confirmation', 'pin', 'image_src', 'id', 'uuid', 'restaurant_id', 'created_at', 'updated_at']);
        $simplified = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                if ($key === 'items' || $key === 'lines') {
                    $simplified[$key] = count($value) . ' elementos';
                } else {
                    $simplified[$key] = '(detalles complejos)';
                }
            } else {
                $simplified[$key] = $value;
            }
        }
        
        return $simplified;
    }

    private function generateHumanDescription(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        $data = $request->all();
        $resourceType = $this->determineResourceType($request);
        
        $typeName = [
            'product' => 'el producto',
            'order' => 'la comanda',
            'sale' => 'la venta',
            'user' => 'el usuario',
            'family' => 'la familia',
            'table' => 'la mesa',
            'tax' => 'el impuesto',
            'zone' => 'la zona',
        ][$resourceType] ?? 'un recurso';

        // Casos especiales para POST (Creaciones)
        if ($method === 'POST') {
            if ($resourceType === 'order') {
                $itemsCount = count($data['items'] ?? []);
                return "Envió una nueva comanda con $itemsCount productos para la mesa #" . ($data['table_id'] ?? '?');
            }
            if ($resourceType === 'sale') {
                $total = ($data['total'] ?? 0) / 100;
                return "Cerró una cuenta y generó un ticket por $total €";
            }
            if ($resourceType === 'user') return "Creó al usuario \"" . ($data['name'] ?? 'Nuevo') . "\"";
            if ($resourceType === 'product') return "Añadió el producto \"" . ($data['name'] ?? 'Nuevo') . "\" al catálogo";
            
            return "Creó un nuevo " . str_replace('el ', '', $typeName) . (isset($data['name']) ? " (\"{$data['name']}\")" : "");
        }

        // Casos para PUT/PATCH (Actualizaciones)
        if ($method === 'PUT' || $method === 'PATCH') {
            $name = $data['name'] ?? $data['title'] ?? null;
            $nameStr = $name ? " (\"$name\")" : "";
            return "Actualizó los datos de $typeName$nameStr";
        }

        // Casos para DELETE (Eliminaciones)
        if ($method === 'DELETE') {
            return "Eliminó $typeName del sistema";
        }

        return "Realizó una operación en $typeName";
    }
}
