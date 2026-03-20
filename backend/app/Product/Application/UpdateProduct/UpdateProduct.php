<?php

namespace App\Product\Application\UpdateProduct;

use App\Product\Application\Shared\ProductResponse;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Product\Domain\ValueObject\Price;
use App\Product\Domain\ValueObject\ProductName;
use App\Product\Domain\ValueObject\Stock;
use App\Shared\Domain\ValueObject\Uuid;

class UpdateProduct
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    public function __invoke(
        string $id,
        string $familyId,
        string $taxId,
        string $name,
        int $price,
        int $stock,
        ?string $imageSrc = null,
    ): ProductResponse {
        $uuid = Uuid::create($id);
        $product = $this->productRepository->findById($uuid);

        if ($product === null) {
            throw new \InvalidArgumentException('Producto no encontrado');
        }

        $product->update(
            Uuid::create($familyId),
            Uuid::create($taxId),
            ProductName::create($name),
            Price::create($price),
            Stock::create($stock),
            $imageSrc,
        );

        $this->productRepository->save($product);

        return ProductResponse::create($product);
    }
}
