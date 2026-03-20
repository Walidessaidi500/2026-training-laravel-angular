<?php

namespace App\Family\Application\CreateFamily;

use App\Family\Application\Shared\FamilyResponse;
use App\Family\Domain\Entity\Family;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Family\Domain\ValueObject\FamilyName;

class CreateFamily
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
    ) {}

    public function __invoke(string $name): FamilyResponse
    {
        $family = Family::dddCreate(
            FamilyName::create($name),
        );

        $this->familyRepository->save($family);

        return FamilyResponse::create($family);
    }
}
