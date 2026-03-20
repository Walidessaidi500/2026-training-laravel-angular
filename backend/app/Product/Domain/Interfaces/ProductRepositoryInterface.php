<?php

namespace App\Product\Domain\Interfaces;

use App\Product\Domain\Entity\Product;
use App\Shared\Domain\ValueObject\Uuid;

interface ProductRepositoryInterface
{
    public function save(Product $product): void;

    public function findById(Uuid $id): ?Product;

    /**
     * @return Product[]
     */
    public function findAll(): array;

    public function delete(Uuid $id): void;
}
