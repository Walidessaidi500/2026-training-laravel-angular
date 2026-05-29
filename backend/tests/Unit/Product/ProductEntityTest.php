<?php

namespace Tests\Unit\Product;

use App\Product\Domain\Entity\Product;
use App\Product\Domain\ValueObject\Price;
use App\Product\Domain\ValueObject\ProductName;
use App\Product\Domain\ValueObject\Stock;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;
use PHPUnit\Framework\TestCase;

class ProductEntityTest extends TestCase
{
    public function test_ddd_create_builds_product_correctly(): void
    {
        $familyId = Uuid::generate();
        $taxId = Uuid::generate();
        $name = ProductName::create('Pizza');
        $price = Price::create(1000); // 10€
        $stock = Stock::create(50);
        $restaurantId = RestaurantId::create(1);

        $product = Product::dddCreate($familyId, $taxId, $name, $price, $stock, $restaurantId);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertSame('Pizza', $product->name());
        $this->assertEquals(1000, $product->price()->value());
        $this->assertEquals(50, $product->stock());
        $this->assertTrue($product->isActive());
    }

    public function test_decrement_stock_works(): void
    {
        $product = Product::dddCreate(
            null,
            Uuid::generate(),
            ProductName::create('Water'),
            Price::create(100),
            Stock::create(10),
            RestaurantId::create(1)
        );

        $product->decrementStock(3);
        $this->assertEquals(7, $product->stock());
        
        $product->decrementStock(0.5);
        $this->assertEquals(6.5, $product->stock());
    }

    public function test_options_are_handled_correctly(): void
    {
        $options = [
            ['name' => 'Muy hecho', 'price_change' => 0, 'stock_impact' => 1.0],
            ['name' => 'Media ración', 'price_change' => -200, 'stock_impact' => 0.5]
        ];
        $product = Product::dddCreate(
            null,
            Uuid::generate(),
            ProductName::create('Filete'),
            Price::create(1500),
            Stock::create(10),
            RestaurantId::create(1),
            true,
            null,
            $options
        );

        $this->assertSame($options, $product->options());
        
        $newOptions = [['name' => 'Sin sal', 'price_change' => 0, 'stock_impact' => 1.0]];
        $product->update(
            null,
            $product->taxId(),
            ProductName::create('Filete'),
            $product->price(),
            Stock::create(10),
            true,
            null,
            $newOptions
        );
        
        $this->assertSame($newOptions, $product->options());
    }

    public function test_toggle_active_works(): void
    {
        $product = Product::dddCreate(
            null,
            Uuid::generate(),
            ProductName::create('Beer'),
            Price::create(200),
            Stock::create(20),
            RestaurantId::create(1)
        );

        $this->assertTrue($product->isActive());
        $product->toggleActive();
        $this->assertFalse($product->isActive());
        $product->toggleActive();
        $this->assertTrue($product->isActive());
    }
}
