<?php

namespace App\Zone\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Table;
use Illuminate\Pagination\LengthAwarePaginator;

interface TableRepositoryInterface
{
    public function save(Table $table): void;

    public function findById(Uuid $id): ?Table;

    /**
     * @return Table[]
     */
    public function findAll(): array;

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;

    public function delete(Uuid $id): void;
    public function deleteByZoneUuid(Uuid $zoneUuid): void;
}
