<?php

namespace App\Movement\Infrastructure\Entrypoint\Http\Middleware;

use App\Shared\Infrastructure\Services\MovementLogger;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use App\Table\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordMovementMiddleware
{
    public function __construct(
        private MovementLogger $logger,
        private UserRepositoryInterface $userRepository,
        private FamilyRepositoryInterface $familyRepository,
        private TaxRepositoryInterface $taxRepository,
        private TableRepositoryInterface $tableRepository,
        private ZoneRepositoryInterface $zoneRepository,
        private ProductRepositoryInterface $productRepository
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

    private function resolveIdToName(string $key, $value): string
    {
        if (!$value || !is_string($value) || strlen($value) < 20) {
            return (string)$value;
        }

        try {
            $uuid = Uuid::create($value);
            
            if ($key === 'family_id' || $key === 'family') {
                $family = $this->familyRepository->findById($uuid);
                return $family ? $family->name() : $value;
            }
            if ($key === 'tax_id' || $key === 'tax') {
                $tax = $this->taxRepository->findById($uuid);
                return $tax ? $tax->name() : $value;
            }
            if ($key === 'table_id' || $key === 'table_uuid' || $key === 'joined_to_uuid' || $key === 'table') {
                $table = $this->tableRepository->findById($uuid);
                return $table ? $table->name() : $value;
            }
            if ($key === 'zone_id' || $key === 'zone') {
                $zone = $this->zoneRepository->findById($uuid);
                return $zone ? $zone->name() : $value;
            }
            if ($key === 'user_id' || $key === 'user_uuid' || $key === 'opened_by_user_uuid' || $key === 'user') {
                $user = $this->userRepository->findById($uuid);
                return $user ? $user->name() : $value;
            }
            if ($key === 'product_id' || $key === 'product') {
                $product = $this->productRepository->findById($uuid);
                return $product ? $product->name() : $value;
            }
        } catch (\Exception $e) {
            // Not a UUID or other error
        }

        return (string)$value;
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
                $simplified[$key] = $this->resolveIdToName($key, $value);
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
                $tableName = $this->resolveIdToName('table_id', $data['table_id'] ?? null);
                return "Envió una nueva comanda con $itemsCount productos para la mesa $tableName";
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
            if (!$name && $resourceType) {
                $id = $this->determineResourceId($request);
                if ($id) {
                    $resolvedName = $this->resolveIdToName($resourceType, $id);
                    if ($resolvedName !== $id) {
                        $name = $resolvedName;
                    }
                }
            }
            $nameStr = $name ? " (\"$name\")" : "";
            return "Actualizó los datos de $typeName$nameStr";
        }

        // Casos para DELETE (Eliminaciones)
        if ($method === 'DELETE') {
            $name = null;
            if ($resourceType) {
                $id = $this->determineResourceId($request);
                if ($id) {
                    $resolvedName = $this->resolveIdToName($resourceType, $id);
                    if ($resolvedName !== $id) {
                        $name = $resolvedName;
                    }
                }
            }
            $nameStr = $name ? " (\"$name\")" : "";
            return "Eliminó $typeName$nameStr del sistema";
        }

        return "Realizó una operación en $typeName";
    }
}
