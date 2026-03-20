<?php

namespace App\Tax\Application\GetTax;

use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Application\Shared\TaxResponse;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;

class GetTax
{
    public function __construct(
        private TaxRepositoryInterface $taxRepository,
    ) {}

    public function __invoke(string $id): TaxResponse
    {
        $uuid = Uuid::create($id);
        $tax = $this->taxRepository->findById($uuid);

        if ($tax === null) {
            throw new \InvalidArgumentException('Impuesto no encontrado');
        }

        return TaxResponse::create($tax);
    }
}
