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
    ) {
    }

    public function execute(ProcessSaleRequest $request): void
    {
        $restaurantId = RestaurantId::create($request->restaurantId);
        $tableUuid = Uuid::create($request->tableUuid);
        $userUuid = Uuid::create($request->userUuid);

        DB::transaction(function () use ($restaurantId, $tableUuid, $userUuid, $request) {
            // 1. Get current order
            $order = $this->orderRepository->findByTable($tableUuid, 'open');
            
            if (!$order) {
                // If no order exists, we create a temporary one to satisfy requirements,
                // but normally we should have an order.
                $orderId = Uuid::generate();
                $order = Order::fromPersistence(
                    $orderId->value(),
                    $restaurantId->value(),
                    'open',
                    $tableUuid->value(),
                    $userUuid->value(),
                    null,
                    $request->diners,
                    new \DateTimeImmutable(),
                    null,
                    [],
                    new \DateTimeImmutable(),
                    new \DateTimeImmutable()
                );
            }

            // 2. Identify what is being sold in this transaction
            $soldLinesData = $request->lines;
            
            // 3. Create Sale
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
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                0, // total is calculated in entity if using dddCreate, but here we pass it desestructured
                $saleLines,
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                $request->paymentMethod,
                $request->amountCash,
                $request->amountCard
            );

            // Calculate total for sale if not using dddCreate directly
            $saleTotal = array_reduce($saleLines, function ($carry, $line) {
                return $carry + ($line->price() * $line->quantity());
            }, 0);
            
            // We need to use a reflection or a setter if total is private and no way to set it in fromPersistence
            // Actually fromPersistence has $total parameter.
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
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                $saleTotal,
                $saleLines,
                new \DateTimeImmutable(),
                new \DateTimeImmutable(),
                $request->paymentMethod,
                $request->amountCash,
                $request->amountCard
            );

            // Assign a ticket number
            $lastTicketNumber = DB::table('sales')->where('restaurant_id', $restaurantId->value())->max('ticket_number') ?? 0;
            $sale->close($userUuid, $lastTicketNumber + 1);
            $this->saleRepository->save($sale);

            // 4. Update Order: subtract sold quantities from the current order lines
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
                        new \DateTimeImmutable()
                    );
                }
                
                // If soldQty > 0, we also update stock (already decremented when sent to kitchen, 
                // but here it's already sold, so no delta changes needed unless we logic differently.
                // In current logic, sendOrder decrements stock. closeTicket should not decrement it again.
            }

            // Update order with remaining lines
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
                new \DateTimeImmutable()
            );

            // 5. If no lines remaining, close (invoice) the order
            if (empty($newOrderLines)) {
                $order->invoice($userUuid);
            }
            
            $this->orderRepository->save($order);
        });
    }
}
