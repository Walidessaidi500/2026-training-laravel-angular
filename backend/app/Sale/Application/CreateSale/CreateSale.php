<?php

namespace App\Sale\Application\CreateSale;

use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Sale\Domain\Entity\Sale;
use App\Sale\Domain\Entity\SaleLine;
use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class CreateSale
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository,
        private OrderRepositoryInterface $orderRepository,
    ) {}

    public function execute(CreateSaleRequest $request): CreateSaleResponse
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $orderUuid = Uuid::create($request->orderUuid);
        $userUuid = Uuid::create($request->userUuid);
        $openedByUserUuid = Uuid::create($request->openedByUserUuid);

        $order = $this->orderRepository->find($orderUuid);
        if (! $order) {
            throw new \Exception('Order not found');
        }

        $saleId = Uuid::generate();
        $lines = array_map(function ($line) use ($restaurantId, $saleId, $userUuid) {
            return SaleLine::dddCreate(
                $restaurantId,
                $saleId,
                Uuid::create($line['order_line_uuid']),
                Uuid::create($line['product_uuid']),
                $userUuid,
                $line['quantity'],
                $line['price'],
                $line['tax_percentage']
            );
        }, $request->lines);

        $sale = Sale::fromPersistence(
            $saleId->value(),
            $restaurantId->value(),
            $order->id()->value(),
            $order->tableId()->value(),
            $userUuid->value(),
            $openedByUserUuid->value(),
            null, 
            null,
            $order->diners(),
            new \DateTimeImmutable,
            null,
            new \DateTimeImmutable,
            0,
            $lines,
            new \DateTimeImmutable,
            new \DateTimeImmutable
        );

        $this->saleRepository->save($sale);

        $order->invoice($userUuid);
        $this->orderRepository->save($order);

        return CreateSaleResponse::create($sale);
    }
}
