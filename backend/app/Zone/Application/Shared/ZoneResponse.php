<?php

namespace App\Zone\Application\Shared;

use App\Zone\Domain\Entity\Zone;

class ZoneResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $name,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Zone $zone): self
    {
        return new self(
            $zone->id()->value(),
            $zone->name(),
            $zone->createdAt()->format('Y-m-d\TH:i:s'),
            $zone->updatedAt()->format('Y-m-d\TH:i:s'),
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
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
