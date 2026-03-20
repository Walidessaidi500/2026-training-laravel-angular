<?php

namespace App\Product\Domain\Entity;

use App\Product\Domain\ValueObject\Price;
use App\Product\Domain\ValueObject\ProductName;
use App\Product\Domain\ValueObject\Stock;
use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\Uuid;

class Product
{
    private function __construct(
        private Uuid $id,
        private Uuid $familyId,
        private Uuid $taxId,
        private ProductName $name,
        private Price $price,
        private Stock $stock,
        private bool $active,
        private ?string $imageSrc,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public static function dddCreate(
        Uuid $familyId,
        Uuid $taxId,
        ProductName $name,
        Price $price,
        Stock $stock,
        ?string $imageSrc = null,
    ): self {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $familyId,
            $taxId,
            $name,
            $price,
            $stock,
            true,
            $imageSrc,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        string $familyId,
        string $taxId,
        string $name,
        int $price,
        int $stock,
        bool $active,
        ?string $imageSrc,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            Uuid::create($familyId),
            Uuid::create($taxId),
            ProductName::create($name),
            Price::create($price),
            Stock::create($stock),
            $active,
            $imageSrc,
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function familyId(): Uuid
    {
        return $this->familyId;
    }

    public function taxId(): Uuid
    {
        return $this->taxId;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function price(): int
    {
        return $this->price->value();
    }

    public function stock(): int
    {
        return $this->stock->value();
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function imageSrc(): ?string
    {
        return $this->imageSrc;
    }

    public function update(
        Uuid $familyId,
        Uuid $taxId,
        ProductName $name,
        Price $price,
        Stock $stock,
        ?string $imageSrc = null,
    ): void {
        $this->familyId = $familyId;
        $this->taxId = $taxId;
        $this->name = $name;
        $this->price = $price;
        $this->stock = $stock;
        $this->imageSrc = $imageSrc;
        $this->updatedAt = DomainDateTime::now();
    }

    public function toggleActive(): void
    {
        $this->active = ! $this->active;
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
