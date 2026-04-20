<?php

namespace App\Sale\Domain\Interfaces;

use App\Sale\Domain\Entity\Sale;
use App\Shared\Domain\ValueObject\Uuid;

interface SaleRepositoryInterface
{
    public function save(Sale $sale): void;

    public function find(Uuid $uuid): ?Sale;

    public function delete(Uuid $uuid): void;

    public function list(int $page, int $perPage, ?int $restaurantId): array;
}
