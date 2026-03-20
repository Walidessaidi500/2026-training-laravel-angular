<?php

namespace App\Tax\Application\UpdateTax;

use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Application\Shared\TaxResponse;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use App\Tax\Domain\ValueObject\TaxName;
use App\Tax\Domain\ValueObject\TaxPercentage;

class UpdateTax
{
    public function __construct(
        private TaxRepositoryInterface $taxRepository,
    ) {}

    public function __invoke(string $id, string $name, int $percentage): TaxResponse
    {
        $uuid = Uuid::create($id);
        $tax = $this->taxRepository->findById($uuid);

        if ($tax === null) {
            throw new \InvalidArgumentException('Impuesto no encontrado');
        }

        $tax->update(TaxName::create($name), TaxPercentage::create($percentage));

        $this->taxRepository->save($tax);

        return TaxResponse::create($tax);
    }
}
