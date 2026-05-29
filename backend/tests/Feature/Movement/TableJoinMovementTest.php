<?php

namespace Tests\Feature\Movement;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Table\Infrastructure\Persistence\Models\EloquentTable;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Zone\Infrastructure\Persistence\Models\EloquentZone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TableJoinMovementTest extends TestCase
{
    use RefreshDatabase;

    public function test_joining_tables_records_detailed_movement(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $user = EloquentUser::factory()->create([
            'restaurant_id' => $restaurant->id,
            'role' => 'admin',
        ]);
        
        $zone = EloquentZone::factory()->create(['restaurant_id' => $restaurant->id]);
        $table1 = EloquentTable::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'name' => 'Mesa 1',
        ]);
        $table2 = EloquentTable::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'name' => 'Mesa 2',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tables/{$table1->uuid}", [
            'zone_id' => $zone->uuid,
            'name' => 'Mesa 1',
            'joined_to_uuid' => $table2->uuid,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('movements', [
            'action' => 'put_tables',
            'resource_type' => 'table',
            'resource_id' => $table1->uuid,
            'description' => "Juntó la mesa \"Mesa 1\" con la mesa \"Mesa 2\"",
        ]);
    }

    public function test_separating_tables_records_detailed_movement(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $user = EloquentUser::factory()->create([
            'restaurant_id' => $restaurant->id,
            'role' => 'admin',
        ]);
        
        $zone = EloquentZone::factory()->create(['restaurant_id' => $restaurant->id]);
        $table2 = EloquentTable::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'name' => 'Mesa 2',
        ]);
        $table1 = EloquentTable::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'name' => 'Mesa 1',
            'joined_to_uuid' => $table2->uuid,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/tables/{$table1->uuid}", [
            'zone_id' => $zone->uuid,
            'name' => 'Mesa 1',
            'joined_to_uuid' => null,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('movements', [
            'action' => 'put_tables',
            'resource_type' => 'table',
            'resource_id' => $table1->uuid,
            'description' => "Separó la mesa \"Mesa 1\" de su unión",
        ]);
    }
}
