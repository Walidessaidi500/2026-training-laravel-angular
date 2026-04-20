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
            // 1. Get or Create Order
            $order = $this->orderRepository->findByTable($tableUuid, 'open');
            
            $oldQuantitiesByProduct = [];
            if ($order) {
                foreach ($order->lines() as $line) {
                    $productUuid = $line->productId()->value();
                    $oldQuantitiesByProduct[$productUuid] = ($oldQuantitiesByProduct[$productUuid] ?? 0) + $line->quantity();
                }
            } else {
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
                    [], // Temporary empty lines
                    new \DateTimeImmutable(),
                    new \DateTimeImmutable()
                );
            }

            // Sync lines first to match what's in the cart
            $newLines = array_map(function ($line) use ($restaurantId, $order, $userUuid) {
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

            $newQuantitiesByProduct = [];
            foreach ($newLines as $line) {
                $productUuid = $line->productId()->value();
                $newQuantitiesByProduct[$productUuid] = ($newQuantitiesByProduct[$productUuid] ?? 0) + $line->quantity();
            }

            // Calculate deltas and update stock
            $allProductUuids = array_unique(array_merge(array_keys($oldQuantitiesByProduct), array_keys($newQuantitiesByProduct)));

            foreach ($allProductUuids as $productUuid) {
                $oldQty = $oldQuantitiesByProduct[$productUuid] ?? 0;
                $newQty = $newQuantitiesByProduct[$productUuid] ?? 0;
                $delta = $newQty - $oldQty;

                if ($delta !== 0) {
                    $product = $this->productRepository->findById(Uuid::create($productUuid));
                    if ($product) {
                        if ($delta > 0) {
                            $product->decrementStock($delta);
                        } else {
                            $product->incrementStock(abs($delta));
                        }
                        $this->productRepository->save($product);
                    }
                }
            }

            $order = Order::fromPersistence(
                $order->id()->value(),
                $order->restaurantId()->value(),
                $order->status(),
                $order->tableId()->value(),
                $order->openedByUserId()->value(),
                $order->closedByUserId()?->value(),
                $request->diners,
                $order->openedAt()->value(),
                $order->closedAt()?->value(),
                $newLines,
                new \DateTimeImmutable(),
                new \DateTimeImmutable()
            );

            $this->orderRepository->save($order);

            // 2. Create Sale
            $saleId = Uuid::generate();
            $saleLines = array_map(function ($orderLine) use ($restaurantId, $saleId, $userUuid) {
                return SaleLine::dddCreate(
                    $restaurantId,
                    $saleId,
                    $orderLine->id(),
                    $orderLine->productId(),
                    $userUuid,
                    $orderLine->quantity(),
                    $orderLine->price(),
                    $orderLine->taxPercentage()
                );
            }, $order->lines());

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
                0,
                $saleLines,
                new \DateTimeImmutable(),
                new \DateTimeImmutable()
            );

            // Assign a ticket number
            $lastTicketNumber = DB::table('sales')->where('restaurant_id', $restaurantId->value())->max('ticket_number') ?? 0;
            $sale->close($userUuid, $lastTicketNumber + 1);

            $this->saleRepository->save($sale);

            // 3. Invoice Order
            $order->invoice($userUuid);
            $this->orderRepository->save($order);
        });
    }
}
