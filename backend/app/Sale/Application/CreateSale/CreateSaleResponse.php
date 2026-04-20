<?php

namespace App\Sale\Application\CreateSale;

use App\Sale\Domain\Entity\Sale;

class CreateSaleResponse
{
    private function __construct(
        public string $uuid,
        public int $restaurantId,
    ) {
    }

    public static function create(Sale $sale): self
    {
        return new self($sale->id()->value(), $sale->restaurantId()->value());
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'restaurant_id' => $this->restaurantId,
        ];
    }
}
