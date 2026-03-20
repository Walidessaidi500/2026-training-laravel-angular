<?php

namespace App\Zone\Application\ListTables;

use App\Zone\Application\Shared\TableResponse;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;

class ListTables
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    /** @return array<int, array<string, mixed>> */
    public function __invoke(): array
    {
        return array_map(
            fn ($table) => TableResponse::create($table)->toArray(),
            $this->tableRepository->findAll(),
        );
    }
}
