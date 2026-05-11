<?php

namespace App\Order\Application\CreateOrder;

use App\Order\Domain\Entity\Order;
use App\Order\Domain\Entity\OrderLine;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class CreateOrder
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {}

    public function execute(CreateOrderRequest $request): CreateOrderResponse
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $tableUuid = Uuid::create($request->tableUuid);
        $openedByUserUuid = Uuid::create($request->openedByUserUuid);

        $existingOrder = $this->orderRepository->findByTable($tableUuid, 'open');
        if ($existingOrder) {
        }

        $orderId = Uuid::generate();
        $lines = array_map(function ($line) use ($restaurantId, $orderId) {
            return OrderLine::dddCreate(
                $restaurantId,
                $orderId,
                Uuid::create($line['product_uuid']),
                Uuid::create($line['user_uuid']),
                $line['quantity'],
                $line['price'],
                $line['tax_percentage']
            );
        }, $request->lines);

        $order = Order::fromPersistence(
            $orderId->value(),
            $restaurantId->value(),
            'open',
            $tableUuid->value(),
            $openedByUserUuid->value(),
            null,
            $request->diners,
            new \DateTimeImmutable,
            null,
            $lines,
            new \DateTimeImmutable,
            new \DateTimeImmutable
        );

        $this->orderRepository->save($order);

        return CreateOrderResponse::create($order);
    }
}
