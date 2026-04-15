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
        public readonly string $createdAt,
        public readonly string $updatedAt,
    ) {
    }

    public static function create(Product $product): self
    {
        return new self(
            $product->id()->value(),
            $product->familyId()->value(),
            $product->taxId()->value(),
            $product->name(),
            $product->price()->value(),
            $product->stock(),
            $product->isActive(),
            $product->imageSrc(),
            $product->createdAt()->format('Y-m-d\TH:i:s'),
            $product->updatedAt()->format('Y-m-d\TH:i:s'),
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
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
