<?php

namespace App\Zone\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Zone;

interface ZoneRepositoryInterface
{
    public function save(Zone $zone): void;

    public function findById(Uuid $id): ?Zone;

    /**
     * @return Zone[]
     */
    public function findAll(): array;

    public function delete(Uuid $id): void;
}
