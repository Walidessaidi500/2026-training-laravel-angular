<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;

class GetOrderController
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {
    }

    public function __invoke(string $uuid): JsonResponse
    {
        $order = $this->orderRepository->find(Uuid::create($uuid));

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }
}