<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;

class DeleteOrderController
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {
    }

    public function __invoke(string $uuid): JsonResponse
    {
        $this->orderRepository->delete(Uuid::create($uuid));

        return response()->json(['message' => 'Order deleted']);
    }
}