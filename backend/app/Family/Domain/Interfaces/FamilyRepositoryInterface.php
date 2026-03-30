<?php

namespace App\Family\Domain\Interfaces;

use App\Family\Domain\Entity\Family;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Pagination\LengthAwarePaginator;

interface FamilyRepositoryInterface
{
    public function save(Family $family): void;

    public function findById(Uuid $id): ?Family;

    /**
     * @return Family[]
     */
    public function findAll(): array;

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;

    public function delete(Uuid $id): void;
}
