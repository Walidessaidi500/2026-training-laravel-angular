<?php

namespace App\Zone\Application\CreateZone;

use App\Zone\Application\Shared\ZoneResponse;
use App\Zone\Domain\Entity\Zone;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Zone\Domain\ValueObject\ZoneName;

class CreateZone
{
    public function __construct(private ZoneRepositoryInterface $zoneRepository) {}

    public function __invoke(string $name, int $restaurantId): ZoneResponse
    {
        $zone = Zone::dddCreate(ZoneName::create($name), $restaurantId);
        $this->zoneRepository->save($zone);

        return ZoneResponse::create($zone);
    }
}
