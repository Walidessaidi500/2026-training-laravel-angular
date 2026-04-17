<?php

namespace App\Product\Application\CreateProduct;

use App\Product\Application\Shared\ProductResponse;
use App\Product\Domain\Entity\Product;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Product\Domain\ValueObject\Price;
use App\Product\Domain\ValueObject\ProductName;
use App\Product\Domain\ValueObject\RestaurantId;
use App\Product\Domain\ValueObject\Stock;
use App\Shared\Domain\ValueObject\Uuid;

class CreateProduct
{
    public function __construct(
        private ProductRepositoryInterface $productRepository,
    ) {}

    // Recibe tipos primitivos y los convierte en VOs
    public function __invoke(
        ?string $familyId,
        ?string $taxId,
        string $name,
        int $priceInCents,
        int $stock,
        int $restaurantId,
        bool $active = true,
        ?string $imageSrc = null,
    ): ProductResponse {
        $product = Product::dddCreate(
            $familyId ? Uuid::create($familyId) : null,
            $taxId ? Uuid::create($taxId) : null,
            ProductName::create($name),
            Price::create($priceInCents),
            Stock::create($stock),
            RestaurantId::create($restaurantId),
            $active,
            $imageSrc,
        );

        $this->productRepository->save($product);

        return ProductResponse::create($product);
    }
}
