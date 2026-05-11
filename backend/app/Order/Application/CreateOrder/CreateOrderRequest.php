<?php

namespace App\Order\Application\CreateOrder;

class CreateOrderRequest
{
    public function __construct(
        public int $restaurantId,
        public string $tableUuid,
        public string $openedByUserUuid,
        public int $diners,
        public array $lines, 
    ) {}
}
