<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\CreateFamily\CreateFamily;
use App\Family\Application\DeleteFamily\DeleteFamily;
use App\Family\Application\GetFamily\GetFamily;
use App\Family\Application\ToggleFamilyActive\ToggleFamilyActive;
use App\Family\Application\UpdateFamily\UpdateFamily;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyController
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
        private CreateFamily $createFamily,
        private UpdateFamily $updateFamily,
        private DeleteFamily $deleteFamily,
        private GetFamily $getFamily,
        private ToggleFamilyActive $toggleFamilyActive,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $families = $this->familyRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $families->items(),
            'meta' => [
                'current_page' => $families->currentPage(),
                'per_page' => $families->perPage(),
                'total' => $families->total(),
                'last_page' => $families->lastPage(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getFamily)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $restaurantId = $request->user()->restaurant_id;

        $response = ($this->createFamily)($validated['name'], (int) $restaurantId, (bool) ($validated['active'] ?? true));

        return new JsonResponse($response->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'active' => ['required', 'boolean'],
        ]);

        try {
            $response = ($this->updateFamily)($uuid, $validated['name'], (bool) $validated['active']);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteFamily)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function toggleActive(string $uuid): JsonResponse
    {
        try {
            $response = ($this->toggleFamilyActive)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
