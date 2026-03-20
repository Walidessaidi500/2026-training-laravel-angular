<?php

namespace App\Tax\Application\DeleteTax;

use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;

class DeleteTax
{
    public function __construct(
        private TaxRepositoryInterface $taxRepository,
    ) {}

    public function __invoke(string $id): void
    {
        $uuid = Uuid::create($id);
        $tax = $this->taxRepository->findById($uuid);

        if ($tax === null) {
            throw new \InvalidArgumentException('Impuesto no encontrado');
        }

        $this->taxRepository->delete($uuid);
    }
}
