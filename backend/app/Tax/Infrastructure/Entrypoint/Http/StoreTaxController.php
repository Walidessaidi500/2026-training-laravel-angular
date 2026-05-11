<?php

namespace App\Tax\Infrastructure\Entrypoint\Http;

use App\Tax\Application\CreateTax\CreateTax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreTaxController
{
    public function __construct(
        private CreateTax $createTax,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50'],
            'percentage' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $restaurantId = $request->user()->restaurant_id;

        $response = ($this->createTax)($validated['name'], $validated['percentage'], (int) $restaurantId);

        return new JsonResponse($response->toArray(), 201);
    }
}
