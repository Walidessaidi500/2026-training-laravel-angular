<?php

namespace App\Order\Application\CreateOrder;

use App\Order\Domain\Entity\Order;

class CreateOrderResponse
{
    private function __construct(
        public string $uuid,
        public string $status,
        public array $lines,
    ) {
    }

    public static function create(Order $order): self
    {
        return new self($order->id()->value(), $order->status(), $order->lines());
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'status' => $this->status,
            'lines' => $this->lines,
        ];
    }
}
