<?php

namespace App\Family\Application\ToggleFamilyActive;

use App\Family\Application\Shared\FamilyResponse;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class ToggleFamilyActive
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
    ) {}

    public function __invoke(string $id): FamilyResponse
    {
        $uuid = Uuid::create($id);
        $family = $this->familyRepository->findById($uuid);

        if ($family === null) {
            throw new \InvalidArgumentException('Familia no encontrada');
        }

        $family->toggleActive();

        $this->familyRepository->save($family);

        return FamilyResponse::create($family);
    }
}
