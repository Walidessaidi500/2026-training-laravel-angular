<?php

namespace App\Order\Application\SyncOrder;

class SyncOrderRequest
{
    public function __construct(
        public int $restaurantId,
        public string $tableUuid,
        public string $userUuid,
        public int $diners,
        public array $lines, // each line: [uuid (optional), product_uuid, quantity, price, tax_percentage]
    ) {
    }
}
