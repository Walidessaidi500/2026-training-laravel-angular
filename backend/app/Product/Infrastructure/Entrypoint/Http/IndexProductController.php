<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;



class IndexProductController{
    public function __construct(
        private ProductRepositoryInterface $productRepository
    ){}

    public function __invoke(Request $request):JsonResponse{
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;
        $active = $request->has('active') ? (bool) $request->query('active') : null;

        $products = $this->productRepository->list($page, $perPage, $restaurantId, $active);
        $aggregates = $this->productRepository->getGlobalStats($restaurantId);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
                'aggregates' => $aggregates
            ],
        ], 200);
    }
}