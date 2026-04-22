<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;

class GetSaleController
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository
    ) {
    }

    public function __invoke(string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find(Uuid::create($uuid));

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale);
    }
}