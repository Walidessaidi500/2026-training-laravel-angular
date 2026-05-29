<?php

namespace Tests\Unit\Zone;

use App\Shared\Domain\ValueObject\RestaurantId;
use App\Zone\Domain\Entity\Zone;
use App\Zone\Domain\ValueObject\ZoneName;
use PHPUnit\Framework\TestCase;

class ZoneEntityTest extends TestCase
{
    public function test_ddd_create_builds_zone_correctly(): void
    {
        $name = ZoneName::create('Terraza');
        $restaurantId = RestaurantId::create(1);

        $zone = Zone::dddCreate($name, $restaurantId);

        $this->assertInstanceOf(Zone::class, $zone);
        $this->assertSame('Terraza', $zone->name());
    }

    public function test_update_name_works(): void
    {
        $zone = Zone::dddCreate(ZoneName::create('Salon'), RestaurantId::create(1));
        $zone->updateName(ZoneName::create('Comedor'));
        $this->assertSame('Comedor', $zone->name());
    }
}
