<?php

namespace App\Zone\Application\GetTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Application\Shared\TableResponse;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;

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
