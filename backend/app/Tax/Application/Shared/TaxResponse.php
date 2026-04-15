<?php

namespace App\Tax\Application\Shared;

use App\Tax\Domain\Entity\Tax;

class TaxResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly int $restaurantId,
        public readonly string $name,
        public readonly int $percentage,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Tax $tax): self
    {
        return new self(
            $tax->id()->value(),
            $tax->restaurantId(),
            $tax->name(),
            $tax->percentage(),
            $tax->createdAt()->format('Y-m-d\TH:i:s'),
            $tax->updatedAt()->format('Y-m-d\TH:i:s'),
        );
    }

    
    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'restaurant_id' => $this->restaurantId,
            'name' => $this->name,
            'percentage' => $this->percentage,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
