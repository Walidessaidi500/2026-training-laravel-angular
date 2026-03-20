<?php

namespace App\Tax\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Domain\Entity\Tax;

interface TaxRepositoryInterface
{
    public function save(Tax $tax): void;

    public function findById(Uuid $id): ?Tax;

    /**
     * @return Tax[]
     */
    public function findAll(): array;

    public function delete(Uuid $id): void;
}
