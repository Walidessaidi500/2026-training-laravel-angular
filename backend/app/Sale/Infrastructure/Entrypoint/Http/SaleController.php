<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Application\ProcessSale\ProcessSale;
use App\Sale\Application\ProcessSale\ProcessSaleRequest;
use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository,
        private ProcessSale $processSale
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $sales = $this->saleRepository->list($page, $perPage, $restaurantId);

        return response()->json($sales);
    }

    public function show(string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find(Uuid::create($uuid));

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale);
    }

    public function process(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_uuid' => 'required|string|exists:tables,uuid',
            'diners' => 'required|integer|min:1',
            'lines' => 'required|array|min:1',
            'lines.*.product_uuid' => 'required|string|exists:products,uuid',
            'lines.*.quantity' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
            'lines.*.tax_percentage' => 'required|integer|min:0',
        ]);

        $processSaleRequest = new ProcessSaleRequest(
            $request->user()->restaurant_id,
            $validated['table_uuid'],
            $request->user()->uuid,
            $validated['diners'],
            $validated['lines']
        );

        $this->processSale->execute($processSaleRequest);

        return response()->json(['message' => 'Sale processed successfully'], 201);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $this->saleRepository->delete(Uuid::create($uuid));

        return response()->json(['message' => 'Sale deleted']);
    }
}
