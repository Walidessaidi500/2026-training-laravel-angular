<?php

namespace App\Family\Domain\Entity;

use App\Family\Domain\ValueObject\FamilyName;
use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Uuid;

class Family implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private FamilyName $name,
        private bool $active,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public static function dddCreate(FamilyName $name): self
    {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $name,
            true,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        string $name,
        bool $active,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            FamilyName::create($name),
            $active,
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function toggleActive(): void
    {
        $this->active = ! $this->active;
        $this->updatedAt = DomainDateTime::now();
    }

    public function updateName(FamilyName $name): void
    {
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

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'name' => $this->name->value(),
            'active' => $this->active,
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
