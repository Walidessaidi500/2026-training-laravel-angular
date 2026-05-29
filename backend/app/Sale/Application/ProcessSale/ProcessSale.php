<?php

namespace App\Sale\Application\ProcessSale;

use App\Order\Domain\Entity\Order;
use App\Order\Domain\Entity\OrderLine;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Sale\Domain\Entity\Sale;
use App\Sale\Domain\Entity\SaleLine;
use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Support\Facades\DB;

class ProcessSale
{
    public function __construct(
        private SaleRepositoryInterface $saleRepository,
        private OrderRepositoryInterface $orderRepository,
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function execute(ProcessSaleRequest $request): Sale
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $tableUuid = Uuid::create($request->tableUuid);
        $userUuid = Uuid::create($request->userUuid);

        return DB::transaction(function () use ($restaurantId, $tableUuid, $userUuid, $request) {
            $order = $this->orderRepository->findByTable($tableUuid, 'open');

            if (! $order) {
                $orderId = Uuid::generate();
                $initialOrderLines = array_map(function ($line) use ($restaurantId, $orderId, $userUuid) {
                    return OrderLine::fromPersistence(
                        $line['uuid'] ?? Uuid::generate()->value(),
                        $restaurantId->value(),
                        $orderId->value(),
                        $line['product_uuid'],
                        $line['product_option'] ?? null,
                        $userUuid->value(),
                        $line['quantity'],
                        $line['price'],
                        $line['tax_percentage'],
                        new \DateTimeImmutable,
                        new \DateTimeImmutable
                    );
                }, $request->lines);

                $order = Order::fromPersistence(
                    $orderId->value(),
                    $restaurantId->value(),
                    'open',
                    $tableUuid->value(),
                    $userUuid->value(),
                    null,
                    $request->diners,
                    new \DateTimeImmutable,
                    null,
                    $initialOrderLines,
                    new \DateTimeImmutable,
                    new \DateTimeImmutable
                );
            }

            $soldLinesData = $request->lines;

            // Asegurarnos de que cada linea de venta tenga el UUID de la linea de pedido correspondiente
            foreach ($soldLinesData as &$soldLine) {
                if (!isset($soldLine['uuid'])) {
                    // Si no tiene UUID, buscamos en las lineas del pedido (recien creadas o existentes)
                    foreach ($order->lines() as $orderLine) {
                        if ($orderLine->productId()->value() === $soldLine['product_uuid']) {
                            $soldLine['uuid'] = $orderLine->id()->value();
                            break;
                        }
                    }
                }
            }
            unset($soldLine);

            $saleId = Uuid::generate();
            $saleLines = array_map(function ($line) use ($restaurantId, $saleId, $userUuid) {
                return SaleLine::dddCreate(
                    $restaurantId,
                    $saleId,
                    Uuid::create($line['uuid'] ?? Uuid::generate()->value()),
                    Uuid::create($line['product_uuid']),
                    $userUuid,
                    $line['quantity'],
                    $line['price'],
                    $line['tax_percentage'],
                    $line['product_option'] ?? null
                );
            }, $soldLinesData);

            $saleTotal = array_reduce($saleLines, function ($carry, $line) {
                return $carry + ($line->price() * $line->quantity());
            }, 0);

            $sale = Sale::fromPersistence(
                $saleId->value(),
                $restaurantId->value(),
                $order->id()->value(),
                $tableUuid->value(),
                $userUuid->value(),
                $order->openedByUserId()->value(),
                $userUuid->value(),
                null,
                $request->diners,
                $order->openedAt()->value(),
                null,
                new \DateTimeImmutable,
                $saleTotal,
                $saleLines,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                $request->paymentMethod,
                $request->amountCash,
                $request->amountCard
            );

            $this->orderRepository->save($order);

            // Asignar un numero de ticket
            $lastTicketNumber = DB::table('sales')->where('restaurant_id', $restaurantId->value())->max('ticket_number') ?? 0;
            $sale->close($userUuid, $lastTicketNumber + 1);
            $this->saleRepository->save($sale);

            $currentOrderLines = $order->lines();
            $newOrderLines = [];

            foreach ($currentOrderLines as $orderLine) {
                $soldQty = 0;
                foreach ($soldLinesData as $soldLine) {
                    if (($soldLine['uuid'] ?? null) === $orderLine->id()->value()) {
                        $soldQty += $soldLine['quantity'];
                    }
                }

                $remainingQty = $orderLine->quantity() - $soldQty;
                if ($remainingQty > 0) {
                    $newOrderLines[] = OrderLine::fromPersistence(
                        $orderLine->id()->value(),
                        $orderLine->restaurantId()->value(),
                        $orderLine->orderId()->value(),
                        $orderLine->productId()->value(),
                        $orderLine->productOption(),
                        $orderLine->userId()->value(),
                        $remainingQty,
                        $orderLine->price(),
                        $orderLine->taxPercentage(),
                        $orderLine->createdAt()->value(),
                        new \DateTimeImmutable
                    );
                }

            }

            $order = Order::fromPersistence(
                $order->id()->value(),
                $order->restaurantId()->value(),
                $order->status(),
                $order->tableId()->value(),
                $order->openedByUserId()->value(),
                $order->closedByUserId()?->value(),
                $order->diners(),
                $order->openedAt()->value(),
                $order->closedAt()?->value(),
                $newOrderLines,
                $order->createdAt()->value(),
                new \DateTimeImmutable
            );

            if (empty($newOrderLines)) {
                $order->invoice($userUuid);
            }

            $this->orderRepository->save($order);

            return $sale;
        });
    }
}
