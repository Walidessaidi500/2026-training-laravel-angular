<?php

namespace App\Zone\Application\CreateTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Application\Shared\TableResponse;
use App\Zone\Domain\Entity\Table;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\ValueObject\TableName;

class CreateTable
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    public function __invoke(string $zoneId, string $name): TableResponse
    {
        $table = Table::dddCreate(Uuid::create($zoneId), TableName::create($name));
        $this->tableRepository->save($table);

        return TableResponse::create($table);
    }
}
