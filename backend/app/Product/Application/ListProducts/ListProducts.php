<?php

namespace App\Product\Application\ListProducts;

use App\Product\Application\Shared\ProductResponse;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;

class ListProducts
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    
    public function __invoke(): array
    {
        $products = $this->productRepository->findAll();

        return array_map(
            fn ($product) => ProductResponse::create($product)->toArray(),
            $products,
        );
    }
}
