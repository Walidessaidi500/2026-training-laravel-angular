<?php

namespace App\Zone\Application\ListZones;

use App\Zone\Application\Shared\ZoneResponse;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;

class ListZones
{
    public function __construct(private ZoneRepositoryInterface $zoneRepository) {}

    
    public function __invoke(): array
    {
        return array_map(
            fn ($zone) => ZoneResponse::create($zone)->toArray(),
            $this->zoneRepository->findAll(),
        );
    }
}
