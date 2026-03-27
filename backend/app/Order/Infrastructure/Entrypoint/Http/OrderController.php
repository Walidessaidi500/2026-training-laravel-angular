<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Infrastructure\Persistence\Models\EloquentOrder;
use App\Order\Infrastructure\Persistence\Repositories\EloquentOrderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController
{
    public function __construct(private EloquentOrderRepository $orderRepository) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);

        $orders = $this->orderRepository->list($page, $perPage);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find($uuid);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'table_id' => 'required|integer|exists:tables,id',
            'opened_by_user_id' => 'required|integer|exists:users,id',
            'diners' => 'required|integer|min:1',
        ]);

        $order = EloquentOrder::create([
            'uuid' => Str::uuid()->toString(),
            'restaurant_id' => $validated['restaurant_id'],
            'table_id' => $validated['table_id'],
            'opened_by_user_id' => $validated['opened_by_user_id'],
            'diners' => $validated['diners'],
            'opened_at' => now(),
            'status' => 'open',
        ]);

        return response()->json($order, 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find($uuid);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'status' => 'string|in:open,closed,cancelled',
            'diners' => 'integer|min:1',
            'closed_by_user_id' => 'nullable|integer|exists:users,id',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'closed') {
            $order->status = 'closed';
            $order->closed_at = now();
            $order->closed_by_user_id = $validated['closed_by_user_id'] ?? auth()->id();
        }

        if (isset($validated['diners'])) {
            $order->diners = $validated['diners'];
        }

        $this->orderRepository->save($order);

        return response()->json($order);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find($uuid);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $this->orderRepository->delete($order);

        return response()->json(['message' => 'Order deleted']);
    }

    public function close(string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find($uuid);

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->status = 'closed';
        $order->closed_at = now();
        $order->closed_by_user_id = auth()->id();

        $this->orderRepository->save($order);

        return response()->json($order);
    }
}
