<?php

namespace App\Order\Infrastructure\Entrypoint\Http;

use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexOrderController
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $orders = $this->orderRepository->list($page, $perPage, $restaurantId);

        return response()->json($orders);
    }
}