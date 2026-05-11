<?php

namespace App\Sale\Application\CreateSale;

class CreateSaleRequest
{
    public function __construct(
        public int $restaurantId,
        public string $orderUuid,
        public string $userUuid,
        public string $openedByUserUuid,
        public array $lines,
    ) {}
}
