<?php

namespace App\Product\Application\ToggleProductActive;

use App\Product\Application\Shared\ProductResponse;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class ToggleProductActive
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function __invoke(string $id): ProductResponse
    {
        $uuid = Uuid::create($id);
        $product = $this->productRepository->findById($uuid);

        if ($product === null) {
            throw new \InvalidArgumentException('Producto no encontrado');
        }

        $product->toggleActive();

        $this->productRepository->save($product);

        return ProductResponse::create($product);
    }
}
