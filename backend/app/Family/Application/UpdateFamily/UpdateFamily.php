<?php

namespace App\Family\Application\UpdateFamily;

use App\Family\Application\Shared\FamilyResponse;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Family\Domain\ValueObject\FamilyName;
use App\Shared\Domain\ValueObject\Uuid;

class UpdateFamily
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
    ) {}

    public function __invoke(string $id, string $name): FamilyResponse
    {
        $uuid = Uuid::create($id);
        $family = $this->familyRepository->findById($uuid);

        if ($family === null) {
            throw new \InvalidArgumentException('Familia no encontrada');
        }

        $family->updateName(FamilyName::create($name));

        $this->familyRepository->save($family);

        return FamilyResponse::create($family);
    }
}
