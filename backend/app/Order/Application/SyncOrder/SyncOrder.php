<?php

namespace App\Order\Application\SyncOrder;

use App\Order\Domain\Entity\Order;
use App\Order\Domain\Entity\OrderLine;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class SyncOrder
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
    ) {
    }

    public function execute(SyncOrderRequest $request): void
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $tableUuid = Uuid::create($request->tableUuid);
        $userUuid = Uuid::create($request->userUuid);

        $order = $this->orderRepository->findByTable($tableUuid, 'open');

        if (!$order) {
            $order = Order::dddCreate(
                $restaurantId,
                $tableUuid,
                $userUuid,
                $request->diners
            );
        }

        $lines = array_map(function ($line) use ($restaurantId, $order, $userUuid) {
            return OrderLine::fromPersistence(
                $line['uuid'] ?? Uuid::generate()->value(),
                $restaurantId->value(),
                $order->id()->value(),
                $line['product_uuid'],
                $userUuid->value(),
                $line['quantity'],
                $line['price'],
                $line['tax_percentage'],
                new \DateTimeImmutable(),
                new \DateTimeImmutable()
            );
        }, $request->lines);

        // We need a way to update lines in Order entity or just recreate the Order object
        $updatedOrder = Order::fromPersistence(
            $order->id()->value(),
            $order->restaurantId()->value(),
            $order->status(),
            $order->tableId()->value(),
            $order->openedByUserId()->value(),
            $order->closedByUserId()?->value(),
            $request->diners,
            $order->openedAt()->value(),
            $order->closedAt()?->value(),
            $lines,
            new \DateTimeImmutable(), // This is technically not correct for created_at but save() uses uuid
            new \DateTimeImmutable()
        );

        $this->orderRepository->save($updatedOrder);
    }
}
