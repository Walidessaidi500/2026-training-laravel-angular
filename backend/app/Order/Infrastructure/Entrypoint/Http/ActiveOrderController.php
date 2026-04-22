<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Http\JsonResponse;

class ActiveOrderController
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {
    }

    public function __invoke(string $tableUuid): JsonResponse
    {
        $order = $this->orderRepository->findByTable(Uuid::create($tableUuid), 'open');

        if (! $order) {
            return response()->json(null, 200);
        }

        return response()->json($order);
    }
}