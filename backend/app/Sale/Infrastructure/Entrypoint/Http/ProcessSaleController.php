<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Application\ProcessSale\ProcessSale;
use App\Sale\Application\ProcessSale\ProcessSaleRequest;
use App\Sale\Application\ProcessSale\ProcessSaleResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcessSaleController
{
    public function __construct(
        private ProcessSale $processSale
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_uuid' => 'required|string|exists:tables,uuid',
            'user_uuid' => 'nullable|string|exists:users,uuid',
            'diners' => 'required|integer|min:1',
            'lines' => 'required|array|min:1',
            'lines.*.uuid' => 'required|string',
            'lines.*.product_uuid' => 'required|string|exists:products,uuid',
            'lines.*.quantity' => 'required|numeric|min:0.01',
            'lines.*.price' => 'required|integer|min:0',
            'lines.*.tax_percentage' => 'required|integer|min:0',
            'payment_method' => 'nullable|string|in:cash,card,mixed',
            'amount_cash' => 'nullable|integer|min:0',
            'amount_card' => 'nullable|integer|min:0',
        ]);

        $processSaleRequest = new ProcessSaleRequest(
            $request->user()->restaurant_id,
            $validated['table_uuid'],
            $validated['user_uuid'] ?? $request->user()->uuid,
            $validated['diners'],
            $validated['lines'],
            $validated['payment_method'] ?? 'cash',
            $validated['amount_cash'] ?? 0,
            $validated['amount_card'] ?? 0
        );

        $sale = $this->processSale->execute($processSaleRequest);
        $response = ProcessSaleResponse::create($sale);

        return response()->json($response->toArray(), 201);
    }
}
