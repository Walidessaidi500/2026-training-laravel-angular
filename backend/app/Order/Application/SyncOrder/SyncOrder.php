<?php

namespace App\Order\Application\SyncOrder;

use App\Order\Domain\Entity\Order;
use App\Order\Domain\Entity\OrderLine;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Support\Facades\DB;

class SyncOrder
{
    public function __construct(
        private OrderRepositoryInterface $orderRepository,
        private ProductRepositoryInterface $productRepository,
    ) {
    }

    public function execute(SyncOrderRequest $request): void
    {
        DB::transaction(function () use ($request) {
            $restaurantId = RestaurantId::create($request->restaurantId);
            $tableUuid = Uuid::create($request->tableUuid);
            $userUuid = Uuid::create($request->userUuid);

            $order = $this->orderRepository->findByTable($tableUuid, 'open');

            $oldQuantitiesByProduct = [];
            if ($order) {
                foreach ($order->lines() as $line) {
                    $productUuid = $line->productId()->value();
                    $oldQuantitiesByProduct[$productUuid] = ($oldQuantitiesByProduct[$productUuid] ?? 0) + $line->quantity();
                }
            } else {
                $order = Order::dddCreate(
                    $restaurantId,
                    $tableUuid,
                    $userUuid,
                    $request->diners
                );
            }

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
                $newLines,
                new \DateTimeImmutable(),
                new \DateTimeImmutable()
            );

            $this->orderRepository->save($updatedOrder);
        });
    }
}
