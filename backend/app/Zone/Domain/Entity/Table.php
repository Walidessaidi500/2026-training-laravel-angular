<?php

namespace App\Zone\Domain\Entity;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\ValueObject\TableName;

class Table implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private int $restaurantId,
        private Uuid $zoneId,
        private TableName $name,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'restaurant_id' => $this->restaurantId,
            'zone_id' => $this->zoneId->value(),
            'name' => $this->name->value(),
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }

    public static function dddCreate(Uuid $zoneId, TableName $name, int $restaurantId): self
    {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $restaurantId,
            $zoneId,
            $name,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $zoneId,
        string $name,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            $restaurantId,
            Uuid::create($zoneId),
            TableName::create($name),
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

    public function zoneId(): Uuid
    {
        return $this->zoneId;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function update(Uuid $zoneId, TableName $name): void
    {
        $this->zoneId = $zoneId;
        $this->name = $name;
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
}
