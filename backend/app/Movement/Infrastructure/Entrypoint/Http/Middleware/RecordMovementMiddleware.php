<?php

namespace App\Movement\Infrastructure\Entrypoint\Http\Middleware;

use App\Shared\Infrastructure\Services\MovementLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RecordMovementMiddleware
{
    public function __construct(
        private MovementLogger $logger
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
        
        // We skip logging the logging itself or login
        if ($action === 'login' || str_contains($request->path(), 'movements')) {
            return;
        }

        $description = $this->generateHumanDescription($request);

        $this->logger->log(
            $action,
            $description,
            $this->determineResourceType($request),
            $this->determineResourceId($request),
            $request->except(['password', 'password_confirmation', 'pin', 'image_src'])
        );
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

    private function generateHumanDescription(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        $data = $request->all();
        $resourceType = $this->determineResourceType($request) ?? 'recurso';
        
        $actionText = 'realizó una acción en';
        if ($method === 'POST') $actionText = 'creó un nuevo';
        if ($method === 'PUT' || $method === 'PATCH') $actionText = 'actualizó el';
        if ($method === 'DELETE') $actionText = 'eliminó el';

        $resourceName = $resourceType;
        if (isset($data['name'])) $resourceName .= ' "' . $data['name'] . '"';
        elseif (isset($data['title'])) $resourceName .= ' "' . $data['title'] . '"';
        elseif (isset($data['ticket_number'])) $resourceName .= ' de ticket #' . $data['ticket_number'];
        elseif (isset($data['table_id'])) $resourceName .= ' para la mesa #' . $data['table_id'];

        // Casos especiales
        if (str_contains($path, 'orders') && $method === 'POST') {
            $itemsCount = count($data['items'] ?? []);
            return "Mandó una comanda con $itemsCount productos para la mesa #" . ($data['table_id'] ?? '?');
        }

        if (str_contains($path, 'sales') && $method === 'POST') {
            return "Cerró la cuenta y generó un ticket por " . (($data['total'] ?? 0) / 100) . "€";
        }

        if (str_contains($path, 'users') && $method === 'POST') {
            return "Creó al usuario " . ($data['name'] ?? 'nuevo');
        }

        return ucfirst("$actionText $resourceName");
    }
}
