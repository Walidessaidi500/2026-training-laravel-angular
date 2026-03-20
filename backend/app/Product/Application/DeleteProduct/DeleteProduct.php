<?php

namespace App\Product\Application\DeleteProduct;

use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class DeleteProduct
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function __invoke(string $id): void
    {
        $uuid = Uuid::create($id);
        $product = $this->productRepository->findById($uuid);

        if ($product === null) {
            throw new \InvalidArgumentException('Producto no encontrado');
        }

        $this->productRepository->delete($uuid);
    }
}
