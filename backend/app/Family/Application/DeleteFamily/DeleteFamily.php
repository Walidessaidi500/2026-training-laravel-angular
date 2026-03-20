<?php

namespace App\Family\Application\DeleteFamily;

use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class DeleteFamily
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
    ) {}

    public function __invoke(string $id): void
    {
        $uuid = Uuid::create($id);
        $family = $this->familyRepository->findById($uuid);

        if ($family === null) {
            throw new \InvalidArgumentException('Familia no encontrada');
        }

        $this->familyRepository->delete($uuid);
    }
}
