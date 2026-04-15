<?php

namespace App\Zone\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Zone;
use Illuminate\Pagination\LengthAwarePaginator;

interface ZoneRepositoryInterface
{
    public function save(Zone $zone): void;

    public function findById(Uuid $id): ?Zone;

    
    public function findAll(): array;

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;

    public function delete(Uuid $id): void;
}
