<?php

namespace App\Zone\Application\Shared;

use App\Zone\Domain\Entity\Table;

class TableResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $zoneId,
        public readonly string $name,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Table $table): self
    {
        return new self(
            $table->id()->value(),
            $table->zoneId()->value(),
            $table->name(),
            $table->createdAt()->format('Y-m-d\TH:i:s'),
            $table->updatedAt()->format('Y-m-d\TH:i:s'),
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'zone_id' => $this->zoneId,
            'name' => $this->name,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
