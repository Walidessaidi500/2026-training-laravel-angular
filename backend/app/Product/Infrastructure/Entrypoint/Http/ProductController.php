<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\CreateProduct\CreateProduct;
use App\Product\Application\DeleteProduct\DeleteProduct;
use App\Product\Application\GetProduct\GetProduct;
use App\Product\Application\ToggleProductActive\ToggleProductActive;
use App\Product\Application\UpdateProduct\UpdateProduct;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
        private CreateProduct $createProduct,
        private UpdateProduct $updateProduct,
        private DeleteProduct $deleteProduct,
        private GetProduct $getProduct,
        private ToggleProductActive $toggleProductActive,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $products = $this->productRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ],
        ]);
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
            'price_in_cents' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_src' => ['nullable', 'string', 'max:255'],
        ]);

        $response = ($this->createProduct)(
            $validated['family_id'],
            $validated['tax_id'],
            $validated['name'],
            $validated['price_in_cents'],
            $validated['stock'],
            (int) $request->user()->restaurant_id,
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
            'price_in_cents' => ['required', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_src' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $response = ($this->updateProduct)(
                $uuid,
                $validated['family_id'],
                $validated['tax_id'],
                $validated['name'],
                $validated['price_in_cents'],
                $validated['stock'],
                (int) $request->user()->restaurant_id,
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
