<?php

namespace App\Product\Domain\Entity;

use App\Product\Domain\ValueObject\Price;
use App\Product\Domain\ValueObject\ProductName;
use App\Product\Domain\ValueObject\Stock;
use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class Product implements \JsonSerializable
{
    // constructor privado garantiza que solo pueda nacer a traves de metodos controlados
    // usa VOs para asegurar que el producto siempre este en estado valido
    private function __construct(
        private Uuid $id,
        private ?Uuid $familyId,
        private ?Uuid $taxId,
        private ProductName $name,
        private Price $price,
        private Stock $stock,
        private RestaurantId $restaurantId,
        private bool $active,
        private ?string $imageSrc,
        private array $options,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {}

    public static function dddCreate(
        ?Uuid $familyId,
        Uuid $taxId,
        ProductName $name,
        Price $price,
        Stock $stock,
        RestaurantId $restaurantId,
        bool $active = true,
        ?string $imageSrc = null,
        array $options = [],
    ): self {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $familyId,
            $taxId,
            $name,
            $price,
            $stock,
            $restaurantId,
            $active,
            $imageSrc,
            $options,
            $now,
            $now,
        );
    }

    public static function fromPersistence(
        string $id,
        ?string $familyId,
        ?string $taxId,
        string $name,
        int $price,
        float $stock,
        int $restaurantId,
        bool $active,
        ?string $imageSrc,
        array $options,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            $familyId ? Uuid::create($familyId) : null,
            $taxId ? Uuid::create($taxId) : null,
            ProductName::create($name),
            Price::create($price),
            Stock::create($stock),
            RestaurantId::create($restaurantId),
            $active,
            $imageSrc,
            $options,
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function familyId(): ?Uuid
    {
        return $this->familyId;
    }

    public function taxId(): ?Uuid
    {
        return $this->taxId;
    }

    public function name(): string
    {
        return $this->name->value();
    }

    public function price(): Price
    {
        return $this->price;
    }

    public function stock(): float
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

    public function options(): array
    {
        return $this->options;
    }

    public function restaurantId(): RestaurantId
    {
        return $this->restaurantId;
    }

    public function update(
        ?Uuid $familyId,
        ?Uuid $taxId,
        ProductName $name,
        Price $price,
        Stock $stock,
        bool $active,
        ?string $imageSrc = null,
        array $options = [],
    ): void {
        $this->familyId = $familyId;
        $this->taxId = $taxId;
        $this->name = $name;
        $this->price = $price;
        $this->stock = $stock;
        $this->active = $active;
        $this->imageSrc = $imageSrc;
        $this->options = $options;
        $this->updatedAt = DomainDateTime::now();
    }

    public function decrementStock(float $quantity): void
    {
        $this->stock = Stock::create($this->stock->value() - $quantity);
        $this->updatedAt = DomainDateTime::now();
    }

    public function incrementStock(float $quantity): void
    {
        $this->stock = Stock::create($this->stock->value() + $quantity);
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

    // Serializa la informacion hacia fuera en JSON
    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'family_id' => $this->familyId?->value(),
            'tax_id' => $this->taxId?->value(),
            'name' => $this->name->value(),
            'priceInCents' => $this->price->value(),
            'stock' => $this->stock->value(),
            'restaurant_id' => $this->restaurantId->value(),
            'active' => $this->active,
            'image_src' => $this->imageSrc,
            'options' => $this->options,
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
