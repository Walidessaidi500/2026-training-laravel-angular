<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\UpdateZone\UpdateZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateZoneController
{
    public function __construct(
        private UpdateZone $updateZone,
    ) {}

    public function __invoke(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $restaurantId = $request->user()?->restaurant_id;

        try {
            return new JsonResponse(($this->updateZone)($uuid, $validated['name'], (int) $restaurantId)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}