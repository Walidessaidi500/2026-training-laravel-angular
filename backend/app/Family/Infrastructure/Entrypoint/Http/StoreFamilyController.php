<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\CreateFamily\CreateFamily;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class StoreFamilyController
{
    public function __construct(
        private CreateFamily $createFamily
    ) {
    }


    public function __invoke(Request $request):JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $restaurantId = $request->user()->restaurant_id;

        $response = ($this->createFamily)($validated['name'], (int) $restaurantId, (bool) ($validated['active'] ?? true));

        return new JsonResponse($response->toArray(), 201);
    }
}
