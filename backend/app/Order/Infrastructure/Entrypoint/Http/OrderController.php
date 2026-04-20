<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Application\SyncOrder\SyncOrder;
use App\Order\Application\SyncOrder\SyncOrderRequest;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private SyncOrder $syncOrder
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $orders = $this->orderRepository->list($page, $perPage, $restaurantId);

        return response()->json($orders);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find(Uuid::create($uuid));

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function activeOrder(string $tableUuid): JsonResponse
    {
        $order = $this->orderRepository->findByTable(Uuid::create($tableUuid), 'open');

        if (! $order) {
            return response()->json(null, 200);
        }

        return response()->json($order);
    }

    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_uuid' => 'required|string|exists:tables,uuid',
            'diners' => 'required|integer|min:1',
            'lines' => 'required|array',
            'lines.*.uuid' => 'nullable|string',
            'lines.*.product_uuid' => 'required|string|exists:products,uuid',
            'lines.*.quantity' => 'required|integer|min:1',
            'lines.*.price' => 'required|integer|min:0',
            'lines.*.tax_percentage' => 'required|integer|min:0',
        ]);

        $syncOrderRequest = new SyncOrderRequest(
            $request->user()->restaurant_id,
            $validated['table_uuid'],
            $request->user()->uuid,
            $validated['diners'],
            $validated['lines']
        );

        $this->syncOrder->execute($syncOrderRequest);

        return response()->json(['message' => 'Order synced successfully']);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $this->orderRepository->delete(Uuid::create($uuid));

        return response()->json(['message' => 'Order deleted']);
    }
}
