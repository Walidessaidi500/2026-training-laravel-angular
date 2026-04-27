<?php

namespace App\Sale\Application\ProcessSale;

class ProcessSaleRequest
{
    public function __construct(
        public int $restaurantId,
        public string $tableUuid,
        public string $userUuid,
        public int $diners,
        public array $lines, // each line: [product_uuid, quantity, price, tax_percentage]
        public string $paymentMethod = 'cash',
        public int $amountCash = 0,
        public int $amountCard = 0,
    ) {
    }
}
