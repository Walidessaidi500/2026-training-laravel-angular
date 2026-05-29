<?php

namespace Tests\Unit\Tax;

use App\Shared\Domain\ValueObject\RestaurantId;
use App\Tax\Domain\Entity\Tax;
use App\Tax\Domain\ValueObject\TaxName;
use App\Tax\Domain\ValueObject\TaxPercentage;
use PHPUnit\Framework\TestCase;

class TaxEntityTest extends TestCase
{
    public function test_ddd_create_builds_tax_correctly(): void
    {
        $name = TaxName::create('IVA');
        $percentage = TaxPercentage::create(21);
        $restaurantId = RestaurantId::create(1);

        $tax = Tax::dddCreate($name, $percentage, $restaurantId);

        $this->assertInstanceOf(Tax::class, $tax);
        $this->assertSame('IVA', $tax->name());
        $this->assertSame(21, $tax->percentage());
    }

    public function test_update_works(): void
    {
        $tax = Tax::dddCreate(
            TaxName::create('IVA 10'),
            TaxPercentage::create(10),
            RestaurantId::create(1)
        );

        $tax->update(TaxName::create('IVA 21'), TaxPercentage::create(21));

        $this->assertSame('IVA 21', $tax->name());
        $this->assertSame(21, $tax->percentage());
    }
}
