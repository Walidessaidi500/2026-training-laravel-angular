<?php

namespace App\Movement\Infrastructure\Entrypoint\Http;

use App\Movement\Application\ListMovements\ListMovements;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListMovementsController
{
    public function __invoke(Request $request, ListMovements $useCase): JsonResponse
    {
        $user = $request->user();
        
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $page = (int) $request->query('page', 1);
        $perPage = (int) $request->query('perPage', 50);
        $restaurantId = $user->restaurant_id;

        $movements = $useCase($page, $perPage, $restaurantId);

        return response()->json([
            'data' => array_map(function ($movement) {
                return [
                    'uuid' => $movement->id()->value(),
                    'user_id' => $movement->userId(),
                    'user_name' => $movement->userName(),
                    'user_email' => $movement->userEmail(),
                    'action' => $movement->action(),
                    'description' => $movement->description(),
                    'resource_type' => $movement->resourceType(),
                    'resource_id' => $movement->resourceId(),
                    'changes' => $movement->changes(),
                    'ip_address' => $movement->ipAddress(),
                    'user_agent' => $movement->userAgent(),
                    'created_at' => $movement->createdAt()->value()->format('Y-m-d H:i:s'),
                ];
            }, $movements->items()),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'last_page' => $movements->lastPage(),
                'per_page' => $movements->perPage(),
                'total' => $movements->total(),
            ],
        ]);
    }
}
