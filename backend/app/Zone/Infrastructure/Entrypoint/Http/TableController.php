<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\CreateTable\CreateTable;
use App\Zone\Application\DeleteTable\DeleteTable;
use App\Zone\Application\GetTable\GetTable;
use App\Zone\Application\ListTables\ListTables;
use App\Zone\Application\UpdateTable\UpdateTable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController
{
    public function __construct(
        private CreateTable $createTable,
        private UpdateTable $updateTable,
        private DeleteTable $deleteTable,
        private ListTables $listTables,
        private GetTable $getTable,
    ) {}

    public function index(): JsonResponse
    {
        return new JsonResponse(($this->listTables)(), 200);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            return new JsonResponse(($this->getTable)($uuid)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'zone_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        return new JsonResponse(($this->createTable)($validated['zone_id'], $validated['name'])->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'zone_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        try {
            return new JsonResponse(($this->updateTable)($uuid, $validated['zone_id'], $validated['name'])->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteTable)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
