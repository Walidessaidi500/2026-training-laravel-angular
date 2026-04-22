<?php

namespace App\Tax\Infrastructure\Entrypoint\Http;

use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexTaxController
{
    public function __construct(
        private TaxRepositoryInterface $taxRepository,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $taxes = $this->taxRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $taxes->items(),
            'meta' => [
                'current_page' => $taxes->currentPage(),
                'per_page' => $taxes->perPage(),
                'total' => $taxes->total(),
                'last_page' => $taxes->lastPage(),
            ],
        ]);
    }
}