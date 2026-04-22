<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Application\ProcessSale\ProcessSale;
use App\Sale\Application\ProcessSale\ProcessSaleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcessSaleController
{
    public function __construct(
        private ProcessSale $processSale
    ) {
    }

    public function __invoke(Request $request): JsonResponse
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


}