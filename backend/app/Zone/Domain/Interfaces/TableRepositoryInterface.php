<?php

namespace App\Zone\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Table;

interface TableRepositoryInterface
{
    public function save(Table $table): void;

    public function findById(Uuid $id): ?Table;

    /**
     * @return Table[]
     */
    public function findAll(): array;

    public function delete(Uuid $id): void;
}
