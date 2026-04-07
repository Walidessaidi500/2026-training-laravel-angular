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

    public function show(Request $request, string $uuid): JsonResponse
    {
        $restaurantId = $request->user()?->restaurant_id;

        try {
            return new JsonResponse(($this->getZone)($uuid, (int) $restaurantId)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $restaurantId = $request->user()->restaurant_id;

        return new JsonResponse(($this->createZone)($validated['name'], (int) $restaurantId)->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $restaurantId = $request->user()?->restaurant_id;

        try {
            return new JsonResponse(($this->updateZone)($uuid, $validated['name'], (int) $restaurantId)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $restaurantId = $request->user()?->restaurant_id;

        try {
            ($this->deleteZone)($uuid, (int) $restaurantId);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
