<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\DeleteZone\DeleteZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteZoneController
{
    public function __construct(
        private DeleteZone $deleteZone,
    ) {}

    public function __invoke(Request $request, string $uuid): JsonResponse
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