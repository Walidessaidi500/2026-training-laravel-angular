<?php

namespace Tests\Unit\Restaurant;

use App\Restaurant\Domain\Entity\Restaurant;
use App\Restaurant\Domain\ValueObject\LegalName;
use App\Restaurant\Domain\ValueObject\PasswordHash;
use App\Restaurant\Domain\ValueObject\RestaurantName;
use App\Restaurant\Domain\ValueObject\RestaurantTaxId;
use App\Shared\Domain\ValueObject\Email;
use PHPUnit\Framework\TestCase;

class RestaurantEntityTest extends TestCase
{
    public function test_ddd_create_builds_restaurant_entity_correctly(): void
    {
        $name = RestaurantName::create('Restaurante Test');
        $legalName = LegalName::create('Legal Name S.L.');
        $taxId = RestaurantTaxId::create('B12345678');
        $email = Email::create('test@restaurant.com');
        $passwordHash = PasswordHash::create('$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

        $restaurant = Restaurant::dddCreate($name, $legalName, $taxId, $email, $passwordHash);

        $this->assertInstanceOf(Restaurant::class, $restaurant);
        $this->assertSame('Restaurante Test', $restaurant->name());
        $this->assertSame('Legal Name S.L.', $restaurant->legalName());
        $this->assertSame('B12345678', $restaurant->taxId());
        $this->assertSame('test@restaurant.com', $restaurant->email()->value());
        $this->assertNotNull($restaurant->id()->value());
    }
}
