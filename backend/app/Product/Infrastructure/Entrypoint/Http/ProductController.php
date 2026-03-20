<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\CreateProduct\CreateProduct;
use App\Product\Application\DeleteProduct\DeleteProduct;
use App\Product\Application\GetProduct\GetProduct;
use App\Product\Application\ListProducts\ListProducts;
use App\Product\Application\ToggleProductActive\ToggleProductActive;
use App\Product\Application\UpdateProduct\UpdateProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController
{
    public function __construct(
        private CreateProduct $createProduct,
        private UpdateProduct $updateProduct,
        private DeleteProduct $deleteProduct,
        private ListProducts $listProducts,
        private GetProduct $getProduct,
        private ToggleProductActive $toggleProductActive,
    ) {}

    public function index(): JsonResponse
    {
        return new JsonResponse(($this->listProducts)(), 200);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getProduct)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => ['required', 'string'],
            'tax_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_src' => ['nullable', 'string', 'max:255'],
        ]);

        $response = ($this->createProduct)(
            $validated['family_id'],
            $validated['tax_id'],
            $validated['name'],
            $validated['price'],
            $validated['stock'],
            $validated['image_src'] ?? null,
        );

        return new JsonResponse($response->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'family_id' => ['required', 'string'],
            'tax_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_src' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $response = ($this->updateProduct)(
                $uuid,
                $validated['family_id'],
                $validated['tax_id'],
                $validated['name'],
                $validated['price'],
                $validated['stock'],
                $validated['image_src'] ?? null,
            );

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteProduct)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function toggleActive(string $uuid): JsonResponse
    {
        try {
            $response = ($this->toggleProductActive)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
