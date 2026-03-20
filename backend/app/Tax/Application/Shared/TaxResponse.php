<?php

namespace App\Tax\Application\Shared;

use App\Tax\Domain\Entity\Tax;

class TaxResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $name,
        public readonly int $percentage,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Tax $tax): self
    {
        return new self(
            $tax->id()->value(),
            $tax->name(),
            $tax->percentage(),
            $tax->createdAt()->format('Y-m-d\TH:i:s'),
            $tax->updatedAt()->format('Y-m-d\TH:i:s'),
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
            'percentage' => $this->percentage,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
