<?php

namespace App\Zone\Application\GetZone;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Application\Shared\ZoneResponse;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;

class GetZone
{
    public function __construct(private ZoneRepositoryInterface $zoneRepository) {}

    public function __invoke(string $id, int $restaurantId): ZoneResponse
    {
        $uuid = Uuid::create($id);
        $zone = $this->zoneRepository->findById($uuid);

        if ($zone === null || $zone->restaurantId() !== $restaurantId) {
            throw new \InvalidArgumentException('Zona no encontrada');
        }

        return ZoneResponse::create($zone);
    }
}
