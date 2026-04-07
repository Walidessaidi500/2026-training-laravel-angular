<?php

namespace App\Zone\Application\UpdateZone;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Application\Shared\ZoneResponse;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Zone\Domain\ValueObject\ZoneName;

class UpdateZone
{
    public function __construct(private ZoneRepositoryInterface $zoneRepository) {}

    public function __invoke(string $id, string $name, int $restaurantId): ZoneResponse
    {
        $uuid = Uuid::create($id);
        $zone = $this->zoneRepository->findById($uuid);

        if ($zone === null || $zone->restaurantId() !== $restaurantId) {
            throw new \InvalidArgumentException('Zona no encontrada');
        }

        $zone->updateName(ZoneName::create($name));
        $this->zoneRepository->save($zone);

        return ZoneResponse::create($zone);
    }
}
