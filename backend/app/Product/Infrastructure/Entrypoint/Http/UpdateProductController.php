<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\UpdateProduct\UpdateProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateProductController
{
    public function __construct(
        private UpdateProduct $updateProduct,

    ){

    }

    public function __invoke(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => ['nullable', 'string'],
            'tax_id' => ['nullable', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'price_in_cents' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'active' => ['required', 'boolean'],
            'image_src' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $response = ($this->updateProduct)(
                $uuid,
                $validated['family_id'] ?? null,
                $validated['tax_id'] ?? null,
                $validated['name'],
                $validated['price_in_cents'],
                $validated['stock'],
                (int) $request->user()->restaurant_id,
                (bool) $validated['active'],
                $validated['image_src'] ?? null,
            );

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}