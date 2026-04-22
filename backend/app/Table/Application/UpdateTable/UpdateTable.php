<?php

namespace App\Table\Application\UpdateTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Table\Application\Shared\TableResponse;
use App\Table\Domain\Interfaces\TableRepositoryInterface;
use App\Table\Domain\ValueObject\TableName;

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
