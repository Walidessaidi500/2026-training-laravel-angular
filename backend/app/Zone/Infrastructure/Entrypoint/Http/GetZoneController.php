<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\GetZone\GetZone;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GetZoneController
{
    public function __construct(
        private GetZone $getZone,
    ) {}

    public function __invoke(Request $request, string $uuid): JsonResponse
    {
        $restaurantId = $request->user()?->restaurant_id;

        try {
            return new JsonResponse(($this->getZone)($uuid, (int) $restaurantId)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}