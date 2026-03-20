<?php

namespace App\Zone\Application\DeleteTable;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;

class DeleteTable
{
    public function __construct(private TableRepositoryInterface $tableRepository) {}

    public function __invoke(string $id): void
    {
        $uuid = Uuid::create($id);
        $table = $this->tableRepository->findById($uuid);

        if ($table === null) {
            throw new \InvalidArgumentException('Mesa no encontrada');
        }

        $this->tableRepository->delete($uuid);
    }
}
