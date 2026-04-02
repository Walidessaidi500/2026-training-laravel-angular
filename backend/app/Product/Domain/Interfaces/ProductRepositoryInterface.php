<?php

namespace App\Product\Domain\Interfaces;

use App\Product\Domain\Entity\Product;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    public function save(Product $product): void;

    public function findById(Uuid $id): ?Product;

    /**
     * @return Product[]
     */
    public function findAll(): array;

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;

    public function delete(Uuid $id): void;

    public function getGlobalStats(?int $restaurantId = null): array;
}
