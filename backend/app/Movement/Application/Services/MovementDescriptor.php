<?php

namespace App\Movement\Application\Services;

use App\Shared\Infrastructure\Services\EntityNameResolver;
use Illuminate\Http\Request;

class MovementDescriptor
{
    public function __construct(
        private EntityNameResolver $entityResolver
    ) {}

    public function determineAction(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();
        
        $parts = explode('/', trim($path, '/'));
        $resource = end($parts);
        if (is_numeric($resource) || strlen($resource) > 20) { 
            $resource = $parts[count($parts) - 2] ?? 'resource';
        }

        return strtolower($method . '_' . $resource);
    }

    public function determineResourceType(Request $request): ?string
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

    public function determineResourceId(Request $request): ?string
    {
        $path = $request->path();
        $parts = explode('/', trim($path, '/'));
        $last = end($parts);
        return (is_numeric($last) || strlen($last) > 20) ? $last : null;
    }

    public function extractSimplifiedChanges(Request $request): array
    {
        $data = $request->except(['password', 'password_confirmation', 'pin', 'image_src', 'id', 'uuid', 'restaurant_id', 'created_at', 'updated_at']);
        $simplified = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $simplified[$key] = ($key === 'items' || $key === 'lines') ? count($value) . ' elementos' : '(detalles complejos)';
            } else {
                $simplified[$key] = $this->entityResolver->resolveIdToName($key, $value);
            }
        }
        
        return $simplified;
    }

    public function generateHumanDescription(Request $request): string
    {
        $method = $request->method();
        $data = $request->all();
        $resourceType = $this->determineResourceType($request);
        
        $typeName = [
            'product' => 'el producto', 'order' => 'la comanda', 'sale' => 'la venta',
            'user' => 'el usuario', 'family' => 'la familia', 'table' => 'la mesa',
            'tax' => 'el impuesto', 'zone' => 'la zona',
        ][$resourceType] ?? 'un recurso';

        if ($method === 'POST') {
            if ($resourceType === 'order') {
                $itemsCount = count($data['lines'] ?? $data['items'] ?? []);
                $tableName = $this->entityResolver->resolveIdToName('table_id', $data['table_uuid'] ?? $data['table_id'] ?? null);
                $verb = $request->attributes->get('movement_order_existed', false) ? "Actualizó" : "Envió";
                return "$verb una comanda con $itemsCount productos para la mesa $tableName";
            }
            if ($resourceType === 'sale') {
                $total = $data['total'] ?? null;
                if ($total === null && isset($data['lines'])) {
                    $total = array_reduce($data['lines'], fn($carry, $line) => $carry + (($line['price'] ?? 0) * ($line['quantity'] ?? 0)), 0);
                }
                return "Cerró una cuenta y generó un ticket por " . (($total ?? 0) / 100) . " €";
            }
            if ($resourceType === 'user') return "Creó al usuario \"" . ($data['name'] ?? 'Nuevo') . "\"";
            if ($resourceType === 'product') return "Añadió el producto \"" . ($data['name'] ?? 'Nuevo') . "\" al catálogo";
            
            return "Creó un nuevo " . str_replace('el ', '', $typeName) . (isset($data['name']) ? " (\"{$data['name']}\")" : "");
        }

        if ($method === 'PUT' || $method === 'PATCH' || $method === 'DELETE') {
            $name = $data['name'] ?? $data['title'] ?? null;
            if (!$name && $resourceType) {
                $id = $this->determineResourceId($request);
                if ($id) {
                    $resolvedName = $this->entityResolver->resolveIdToName($resourceType, $id);
                    $name = ($resolvedName !== $id) ? $resolvedName : $name;
                }
            }
            $nameStr = $name ? " (\"$name\")" : "";
            $actionWord = ($method === 'DELETE') ? "Eliminó" : "Actualizó los datos de";
            return "$actionWord $typeName$nameStr" . ($method === 'DELETE' ? " del sistema" : "");
        }

        return "Realizó una operación en $typeName";
    }
}