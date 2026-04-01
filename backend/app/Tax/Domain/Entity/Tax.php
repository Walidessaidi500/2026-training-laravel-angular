<?php

namespace App\Tax\Domain\Entity;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Domain\ValueObject\TaxName;
use App\Tax\Domain\ValueObject\TaxPercentage;

class Tax implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private int $restaurantId,
        private TaxName $name,
        private TaxPercentage $percentage,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public static function dddCreate(TaxName $name, TaxPercentage $percentage, int $restaurantId): self
    {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $restaurantId,
            $name,
            $percentage,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $name,
        int $percentage,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            $restaurantId,
            TaxName::create($name),
            TaxPercentage::create($percentage),
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function restaurantId(): int
    {
        return $this->restaurantId;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function percentage(): int
    {
        return $this->percentage->value();
    }

    public function update(TaxName $name, TaxPercentage $percentage): void
    {
        $this->name = $name;
        $this->percentage = $percentage;
        $this->updatedAt = DomainDateTime::now();
    }

    public function createdAt(): DomainDateTime
    {
        return $this->createdAt;
    }

    public function updatedAt(): DomainDateTime
    {
        return $this->updatedAt;
    }

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'restaurant_id' => $this->restaurantId,
            'name' => $this->name->value(),
            'percentage' => $this->percentage->value(),
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
