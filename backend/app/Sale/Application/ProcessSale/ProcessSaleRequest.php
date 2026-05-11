<?php

namespace App\Sale\Application\ProcessSale;

class ProcessSaleRequest
{
    public function __construct(
        public int $restaurantId,
        public string $tableUuid,
        public string $userUuid,
        public int $diners,
        public array $lines, 
        public string $paymentMethod = 'cash',
        public int $amountCash = 0,
        public int $amountCard = 0,
    ) {}
}
