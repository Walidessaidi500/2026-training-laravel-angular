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

    public function execute(ProcessSaleRequest $request): void
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $tableUuid = Uuid::create($request->tableUuid);
        $userUuid = Uuid::create($request->userUuid);

        DB::transaction(function () use ($restaurantId, $tableUuid, $userUuid, $request) {
            $order = $this->orderRepository->findByTable($tableUuid, 'open');

            if (! $order) {
                $orderId = Uuid::generate();
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
                    [],
                    new \DateTimeImmutable,
                    new \DateTimeImmutable
                );
            }

            $soldLinesData = $request->lines;

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
                    $line['tax_percentage']
                );
            }, $soldLinesData);

            $sale = Sale::fromPersistence(
                $saleId->value(),
                $restaurantId->value(),
                $order->id()->value(),
                $tableUuid->value(),
                $userUuid->value(),
                $userUuid->value(),
                $userUuid->value(),
                null,
                $request->diners,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                0, 
                $saleLines,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                $request->paymentMethod,
                $request->amountCash,
                $request->amountCard
            );

            $saleTotal = array_reduce($saleLines, function ($carry, $line) {
                return $carry + ($line->price() * $line->quantity());
            }, 0);

            $sale = Sale::fromPersistence(
                $saleId->value(),
                $restaurantId->value(),
                $order->id()->value(),
                $tableUuid->value(),
                $userUuid->value(),
                $userUuid->value(),
                $userUuid->value(),
                null,
                $request->diners,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                $saleTotal,
                $saleLines,
                new \DateTimeImmutable,
                new \DateTimeImmutable,
                $request->paymentMethod,
                $request->amountCash,
                $request->amountCard
            );

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
        });
    }
}
