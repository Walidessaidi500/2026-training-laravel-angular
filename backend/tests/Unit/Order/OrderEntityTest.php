<?php

namespace Tests\Unit\Order;

use App\Order\Domain\Entity\Order;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;
use PHPUnit\Framework\TestCase;

class OrderEntityTest extends TestCase
{
    public function test_ddd_create_builds_order_correctly(): void
    {
        $restaurantId = RestaurantId::create(1);
        $tableId = Uuid::generate();
        $userId = Uuid::generate();
        $diners = 2;

        $order = Order::dddCreate($restaurantId, $tableId, $userId, $diners);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertSame('open', $order->status());
        $this->assertSame($diners, $order->diners());
        $this->assertEquals($tableId->value(), $order->tableId()->value());
    }

    public function test_invoice_works(): void
    {
        $order = Order::dddCreate(
            RestaurantId::create(1),
            Uuid::generate(),
            Uuid::generate(),
            2
        );

        $closedByUserId = Uuid::generate();
        $order->invoice($closedByUserId);

        $this->assertSame('invoiced', $order->status());
        $this->assertEquals($closedByUserId->value(), $order->closedByUserId()->value());
        $this->assertNotNull($order->closedAt());
    }
}
