<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Application\CreateZone\CreateZone;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StoreZoneController
{
    public function __construct(
        private CreateZone $createZone,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $restaurantId = $request->user()->restaurant_id;

        return new JsonResponse(($this->createZone)($validated['name'], (int) $restaurantId)->toArray(), 201);
    }
}