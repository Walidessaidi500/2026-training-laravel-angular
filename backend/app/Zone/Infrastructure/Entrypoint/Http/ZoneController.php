<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\CreateZone\CreateZone;
use App\Zone\Application\DeleteZone\DeleteZone;
use App\Zone\Application\GetZone\GetZone;
use App\Zone\Application\UpdateZone\UpdateZone;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoneController
{
    public function __construct(
        private ZoneRepositoryInterface $zoneRepository,
        private CreateZone $createZone,
        private UpdateZone $updateZone,
        private DeleteZone $deleteZone,
        private GetZone $getZone,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $zones = $this->zoneRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $zones->items(),
            'meta' => [
                'current_page' => $zones->currentPage(),
                'per_page' => $zones->perPage(),
                'total' => $zones->total(),
                'last_page' => $zones->lastPage(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            return new JsonResponse(($this->getZone)($uuid)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);

        return new JsonResponse(($this->createZone)($validated['name'])->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);

        try {
            return new JsonResponse(($this->updateZone)($uuid, $validated['name'])->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteZone)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
