<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\CreateFamily\CreateFamily;
use App\Family\Application\DeleteFamily\DeleteFamily;
use App\Family\Application\GetFamily\GetFamily;
use App\Family\Application\ListFamilies\ListFamilies;
use App\Family\Application\ToggleFamilyActive\ToggleFamilyActive;
use App\Family\Application\UpdateFamily\UpdateFamily;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyController
{
    public function __construct(
        private CreateFamily $createFamily,
        private UpdateFamily $updateFamily,
        private DeleteFamily $deleteFamily,
        private ListFamilies $listFamilies,
        private GetFamily $getFamily,
        private ToggleFamilyActive $toggleFamilyActive,
    ) {}

    public function index(): JsonResponse
    {
        $families = ($this->listFamilies)();

        return new JsonResponse($families, 200);
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
        ]);

        $response = ($this->createFamily)($validated['name']);

        return new JsonResponse($response->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        try {
            $response = ($this->updateFamily)($uuid, $validated['name']);

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
