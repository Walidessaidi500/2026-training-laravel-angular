<?php

namespace App\Zone\Application\DeleteZone;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;

class DeleteZone
{
    public function __construct(
        private ZoneRepositoryInterface $zoneRepository,
        private TableRepositoryInterface $tableRepository
    ) {
    }

    public function __invoke(string $id, int $restaurantId): void
    {
        $uuid = Uuid::create($id);
        $zone = $this->zoneRepository->findById($uuid);

        if ($zone === null || $zone->restaurantId() !== $restaurantId) {
            throw new \InvalidArgumentException('Zona no encontrada');
        }

        $this->tableRepository->deleteByZoneUuid($uuid);
        $this->zoneRepository->delete($uuid);
    }
}
