<?php

namespace App\Family\Application\Shared;

use App\Family\Domain\Entity\Family;

class FamilyResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly int $restaurantId,
        public readonly string $name,
        public readonly bool $active,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Family $family): self
    {
        return new self(
            $family->id()->value(),
            $family->restaurantId(),
            $family->name(),
            $family->isActive(),
            $family->createdAt()->format('Y-m-d\TH:i:s'),
            $family->updatedAt()->format('Y-m-d\TH:i:s'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'restaurant_id' => $this->restaurantId,
            'name' => $this->name,
            'active' => $this->active,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
