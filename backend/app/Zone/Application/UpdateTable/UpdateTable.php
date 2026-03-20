<?php

namespace App\Zone\Application\UpdateTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Application\Shared\TableResponse;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\ValueObject\TableName;

class UpdateTable
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    public function __invoke(string $id, string $zoneId, string $name): TableResponse
    {
        $uuid = Uuid::create($id);
        $table = $this->tableRepository->findById($uuid);

        if ($table === null) {
            throw new \InvalidArgumentException('Mesa no encontrada');
        }

        $table->update(Uuid::create($zoneId), TableName::create($name));
        $this->tableRepository->save($table);

        return TableResponse::create($table);
    }
}
