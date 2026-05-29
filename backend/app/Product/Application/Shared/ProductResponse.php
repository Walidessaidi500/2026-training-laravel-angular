<?php

namespace App\Product\Application\Shared;

use App\Product\Domain\Entity\Product;

class ProductResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $familyId,
        public readonly string $taxId,
        public readonly string $name,
        public readonly int $priceInCents,
        public readonly int $stock,
        public readonly bool $active,
        public readonly ?string $imageSrc,
        public readonly array $options,
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {}

    public static function create(Product $product): self
    {
        return new self(
            $product->id()->value(),
            $product->familyId() ? $product->familyId()->value() : '',
            $product->taxId() ? $product->taxId()->value() : '',
            $product->name(),
            $product->price()->value(),
            $product->stock(),
            $product->isActive(),
            $product->imageSrc(),
            $product->options(),
            $product->createdAt()->value()->format('Y-m-d\TH:i:s.u\Z'),
            $product->updatedAt()->value()->format('Y-m-d\TH:i:s.u\Z'),
        );
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'family_id' => $this->familyId,
            'tax_id' => $this->taxId,
            'name' => $this->name,
            'priceInCents' => $this->priceInCents,
            'stock' => $this->stock,
            'active' => $this->active,
            'image_src' => $this->imageSrc,
            'options' => $this->options,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
