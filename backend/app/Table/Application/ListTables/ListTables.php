<?php

namespace App\Table\Application\ListTables;

use App\Table\Application\Shared\TableResponse;
use App\Table\Domain\Interfaces\TableRepositoryInterface;

class ListTables
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    
    public function __invoke(): array
    {
        return array_map(
            fn ($table) => TableResponse::create($table)->toArray(),
            $this->tableRepository->findAll(),
        );
    }
}
