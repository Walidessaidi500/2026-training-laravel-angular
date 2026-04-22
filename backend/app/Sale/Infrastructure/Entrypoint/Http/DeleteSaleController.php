<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;

class DeleteSaleController
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository
    ) {
    }

    public function __invoke(string $uuid): JsonResponse
    {
        $this->saleRepository->delete(Uuid::create($uuid));

        return response()->json(['message' => 'Sale deleted successfully']);
    }
}