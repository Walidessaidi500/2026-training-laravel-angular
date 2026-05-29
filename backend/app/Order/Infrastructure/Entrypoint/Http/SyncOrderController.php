<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Application\SyncOrder\SyncOrder;
use App\Order\Application\SyncOrder\SyncOrderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncOrderController
{
    public function __construct(
        private SyncOrder $syncOrder
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_uuid' => 'required|string|exists:tables,uuid',
            'opened_by_user_uuid' => 'nullable|string|exists:users,uuid',
            'diners' => 'required|integer|min:1',
            'lines' => 'required|array',
            'lines.*.uuid' => 'nullable|string',
            'lines.*.product_uuid' => 'required|string|exists:products,uuid',
            'lines.*.quantity' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
            'lines.*.tax_percentage' => 'required|integer|min:0',
            'lines.*.product_option' => 'nullable|array',
        ]);

        $syncOrderRequest = new SyncOrderRequest(
            $request->user()->restaurant_id,
            $validated['table_uuid'],
            $validated['opened_by_user_uuid'] ?? $request->user()->uuid,
            $validated['diners'],
            $validated['lines']
        );

        $order = $this->syncOrder->execute($syncOrderRequest);

        return new JsonResponse($order, 200);
    }
}
