<?php

namespace App\Tax\Application\ListTaxes;

use App\Tax\Application\Shared\TaxResponse;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;

class ListTaxes
{
    public function __construct(
        private TaxRepositoryInterface $taxRepository,
    ) {}

    
    public function __invoke(): array
    {
        $taxes = $this->taxRepository->findAll();

        return array_map(
            fn ($tax) => TaxResponse::create($tax)->toArray(),
            $taxes,
        );
    }
}
