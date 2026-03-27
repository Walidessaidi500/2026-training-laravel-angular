<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\CreateTable\CreateTable;
use App\Zone\Application\DeleteTable\DeleteTable;
use App\Zone\Application\GetTable\GetTable;
use App\Zone\Application\UpdateTable\UpdateTable;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController
{
    public function __construct(
        private TableRepositoryInterface $tableRepository,
        private CreateTable $createTable,
        private UpdateTable $updateTable,
        private DeleteTable $deleteTable,
        private GetTable $getTable,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);

        $tables = $this->tableRepository->list($page, $perPage);

        return response()->json([
            'data' => $tables->items(),
            'meta' => [
                'current_page' => $tables->currentPage(),
                'per_page' => $tables->perPage(),
                'total' => $tables->total(),
                'last_page' => $tables->lastPage(),
            ],
        ]);
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
