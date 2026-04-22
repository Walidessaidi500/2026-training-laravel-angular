<?php

namespace App\Table\Application\CreateTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Table\Application\Shared\TableResponse;
use App\Table\Domain\Entity\Table;
use App\Table\Domain\Interfaces\TableRepositoryInterface;
use App\Table\Domain\ValueObject\TableName;

class CreateTable
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    public function __invoke(string $zoneId, string $name, int $restaurantId): TableResponse
    {
        $table = Table::dddCreate(Uuid::create($zoneId), TableName::create($name), $restaurantId);
        $this->tableRepository->save($table);

        return TableResponse::create($table);
    }
}
