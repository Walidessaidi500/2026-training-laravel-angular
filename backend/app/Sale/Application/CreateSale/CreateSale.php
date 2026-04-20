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
    ) {
    }

    public function execute(CreateSaleRequest $request): CreateSaleResponse
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $orderUuid = Uuid::create($request->orderUuid);
        $userUuid = Uuid::create($request->userUuid);
        $openedByUserUuid = Uuid::create($request->openedByUserUuid);

        $order = $this->orderRepository->find($orderUuid);
        if (!$order) {
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
            null, // closed_by_user_id
            null, // ticket_number
            $order->diners(),
            new \DateTimeImmutable(), // opened_at
            null, // closed_at
            new \DateTimeImmutable(), // value_date
            0, // total - will be calculated in save or dddCreate
            $lines,
            new \DateTimeImmutable(), // created_at
            new \DateTimeImmutable() // updated_at
        );
        
        $this->saleRepository->save($sale);
        
        // After saving the sale, the order should be invoiced
        $order->invoice($userUuid);
        $this->orderRepository->save($order);

        return CreateSaleResponse::create($sale);
    }
}
