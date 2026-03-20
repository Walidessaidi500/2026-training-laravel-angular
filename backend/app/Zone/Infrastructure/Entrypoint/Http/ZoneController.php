<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\CreateZone\CreateZone;
use App\Zone\Application\DeleteZone\DeleteZone;
use App\Zone\Application\GetZone\GetZone;
use App\Zone\Application\ListZones\ListZones;
use App\Zone\Application\UpdateZone\UpdateZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ZoneController
{
    public function __construct(
        private CreateZone $createZone,
        private UpdateZone $updateZone,
        private DeleteZone $deleteZone,
        private ListZones $listZones,
        private GetZone $getZone,
    ) {}

    public function index(): JsonResponse
    {
        return new JsonResponse(($this->listZones)(), 200);
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
