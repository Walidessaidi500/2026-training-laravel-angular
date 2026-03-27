<?php

namespace App\Restaurant\Application\Shared;

use App\Restaurant\Domain\Entity\Restaurant;

class RestaurantResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $name,
        public readonly string $legalName,
        public readonly string $taxId,
        public readonly string $email,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Restaurant $restaurant): self
    {
        return new self(
            $restaurant->id()->value(),
            $restaurant->name(),
            $restaurant->legalName(),
            $restaurant->taxId(),
            $restaurant->email()->value(),
            $restaurant->createdAt()->format('Y-m-d\TH:i:s'),
            $restaurant->updatedAt()->format('Y-m-d\TH:i:s'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'legal_name' => $this->legalName,
            'tax_id' => $this->taxId,
            'email' => $this->email,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
