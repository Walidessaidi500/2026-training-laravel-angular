<?php

namespace App\Family\Application\ListFamilies;

use App\Family\Application\Shared\FamilyResponse;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;

class ListFamilies
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository,
    ) {}

    /**
     * @return array<int, array<string, mixed>>
     */
    public function __invoke(): array
    {
        $families = $this->familyRepository->findAll();

        return array_map(
            fn ($family) => FamilyResponse::create($family)->toArray(),
            $families,
        );
    }
}
