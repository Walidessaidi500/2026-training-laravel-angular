<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexSaleController
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $sales = $this->saleRepository->list($page, $perPage, $restaurantId);

        return response()->json($sales);
    }
}