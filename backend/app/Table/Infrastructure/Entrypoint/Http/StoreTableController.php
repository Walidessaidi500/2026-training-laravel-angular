<?php

namespace App\Table\Infrastructure\Entrypoint\Http;

use App\Table\Application\CreateTable\CreateTable;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StoreTableController
{
    public function __construct(
        private CreateTable $createTable,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'zone_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $restaurantId = (int) $request->user()->restaurant_id;

        return new JsonResponse(($this->createTable)($validated['zone_id'], $validated['name'], $restaurantId)->toArray(), 201);
    }
}