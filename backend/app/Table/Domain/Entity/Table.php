<?php

namespace App\Table\Domain\Entity;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Uuid;
use App\Table\Domain\ValueObject\TableName;

class Table implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private int $restaurantId,
        private Uuid $zoneId,
        private TableName $name,
        private ?Uuid $joinedToUuid,
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
            'joined_to_uuid' => $this->joinedToUuid?->value(),
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }

    public static function dddCreate(Uuid $zoneId, TableName $name, int $restaurantId, ?Uuid $joinedToUuid = null): self
    {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $restaurantId,
            $zoneId,
            $name,
            $joinedToUuid,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $zoneId,
        string $name,
        ?string $joinedToUuid,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            $restaurantId,
            Uuid::create($zoneId),
            TableName::create($name),
            $joinedToUuid ? Uuid::create($joinedToUuid) : null,
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

    public function joinedToUuid(): ?Uuid
    {
        return $this->joinedToUuid;
    }

    public function update(Uuid $zoneId, TableName $name, ?Uuid $joinedToUuid = null): void
    {
        $this->zoneId = $zoneId;
        $this->name = $name;
        $this->joinedToUuid = $joinedToUuid;
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
