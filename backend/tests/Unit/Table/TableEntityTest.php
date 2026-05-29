<?php

namespace Tests\Unit\Table;

use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;
use App\Table\Domain\Entity\Table;
use App\Table\Domain\ValueObject\TableName;
use PHPUnit\Framework\TestCase;

class TableEntityTest extends TestCase
{
    public function test_ddd_create_builds_table_correctly(): void
    {
        $zoneId = Uuid::generate();
        $name = TableName::create('Mesa 1');
        $restaurantId = RestaurantId::create(1);

        $table = Table::dddCreate($zoneId, $name, $restaurantId);

        $this->assertInstanceOf(Table::class, $table);
        $this->assertSame('Mesa 1', $table->name());
        $this->assertEquals($zoneId->value(), $table->zoneId()->value());
    }

    public function test_update_works(): void
    {
        $zoneId1 = Uuid::generate();
        $zoneId2 = Uuid::generate();
        $table = Table::dddCreate($zoneId1, TableName::create('M1'), RestaurantId::create(1));

        $table->update($zoneId2, TableName::create('M2'));

        $this->assertSame('M2', $table->name());
        $this->assertEquals($zoneId2->value(), $table->zoneId()->value());
    }
}
