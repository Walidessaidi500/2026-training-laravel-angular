<?php

namespace Tests\Unit\Family;

use App\Family\Domain\Entity\Family;
use App\Family\Domain\ValueObject\FamilyName;
use App\Shared\Domain\ValueObject\RestaurantId;
use PHPUnit\Framework\TestCase;

class FamilyEntityTest extends TestCase
{
    public function test_ddd_create_builds_family_correctly(): void
    {
        $name = FamilyName::create('Bebidas');
        $restaurantId = RestaurantId::create(1);

        $family = Family::dddCreate($name, $restaurantId);

        $this->assertInstanceOf(Family::class, $family);
        $this->assertSame('Bebidas', $family->name());
        $this->assertTrue($family->isActive());
    }

    public function test_toggle_active_works(): void
    {
        $family = Family::dddCreate(FamilyName::create('Comida'), RestaurantId::create(1));
        $this->assertTrue($family->isActive());
        $family->toggleActive();
        $this->assertFalse($family->isActive());
    }

    public function test_update_name_works(): void
    {
        $family = Family::dddCreate(FamilyName::create('Postres'), RestaurantId::create(1));
        $family->updateName(FamilyName::create('Helados'));
        $this->assertSame('Helados', $family->name());
    }
}
