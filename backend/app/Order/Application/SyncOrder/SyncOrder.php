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
    ) {}

    public function execute(SyncOrderRequest $request): Order
    {
        return DB::transaction(function () use ($request) {
            $restaurantId = RestaurantId::create($request->restaurantId);
            $tableUuid = Uuid::create($request->tableUuid);
            $userUuid = Uuid::create($request->userUuid);

            $order = $this->orderRepository->findByTable($tableUuid, 'open');

            $oldStockImpactByProduct = [];
            if ($order) {
                foreach ($order->lines() as $line) {
                    $productUuid = $line->productId()->value();
                    $impact = (isset($line->productOption()['stock_impact'])) ? (float) $line->productOption()['stock_impact'] : 1.0;
                    $oldStockImpactByProduct[$productUuid] = ($oldStockImpactByProduct[$productUuid] ?? 0) + ($line->quantity() * $impact);
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
                    $line['product_option'] ?? null,
                    $userUuid->value(),
                    $line['quantity'],
                    $line['price'],
                    $line['tax_percentage'],
                    new \DateTimeImmutable,
                    new \DateTimeImmutable
                );
            }, $request->lines);

            $newStockImpactByProduct = [];
            foreach ($newLines as $line) {
                $productUuid = $line->productId()->value();
                $impact = (isset($line->productOption()['stock_impact'])) ? (float) $line->productOption()['stock_impact'] : 1.0;
                $newStockImpactByProduct[$productUuid] = ($newStockImpactByProduct[$productUuid] ?? 0) + ($line->quantity() * $impact);
            }

            $allProductUuids = array_unique(array_merge(array_keys($oldStockImpactByProduct), array_keys($newStockImpactByProduct)));

            foreach ($allProductUuids as $productUuid) {
                $oldImpact = $oldStockImpactByProduct[$productUuid] ?? 0;
                $newImpact = $newStockImpactByProduct[$productUuid] ?? 0;
                $delta = $newImpact - $oldImpact;

                if ($delta != 0) {
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
                new \DateTimeImmutable,
                new \DateTimeImmutable
            );

            $this->orderRepository->save($updatedOrder);
            
            return $updatedOrder;
        });
    }
}
