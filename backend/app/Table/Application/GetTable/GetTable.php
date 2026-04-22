<?php

namespace App\Table\Application\GetTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Table\Application\Shared\TableResponse;
use App\Table\Domain\Interfaces\TableRepositoryInterface;

class GetTable
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    public function __invoke(string $id): TableResponse
    {
        $uuid = Uuid::create($id);
        $table = $this->tableRepository->findById($uuid);

        if ($table === null) {
            throw new \InvalidArgumentException('Mesa no encontrada');
        }

        return TableResponse::create($table);
    }
}
