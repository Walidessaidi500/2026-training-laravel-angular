<?php

namespace App\Zone\Application\DeleteZone;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;

class DeleteZone
{
    public function __construct(private ZoneRepositoryInterface $zoneRepository) {}

    public function __invoke(string $id): void
    {
        $uuid = Uuid::create($id);
        $zone = $this->zoneRepository->findById($uuid);

        if ($zone === null) {
            throw new \InvalidArgumentException('Zona no encontrada');
        }

        $this->zoneRepository->delete($uuid);
    }
}
