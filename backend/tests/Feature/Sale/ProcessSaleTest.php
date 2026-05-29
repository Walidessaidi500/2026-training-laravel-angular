<?php

namespace Tests\Feature\Sale;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Table\Infrastructure\Persistence\Models\EloquentTable;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Zone\Infrastructure\Persistence\Models\EloquentZone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProcessSaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_process_sale_successfully(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $user = EloquentUser::factory()->create([
            'restaurant_id' => $restaurant->id,
            'role' => 'operator',
        ]);
        
        $zone = EloquentZone::factory()->create(['restaurant_id' => $restaurant->id]);
        $table = EloquentTable::factory()->create([
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
        ]);
        
        $product = EloquentProduct::factory()->create([
            'restaurant_id' => $restaurant->id,
            'price' => 1000,
        ]);

        Sanctum::actingAs($user);

        $data = [
            'table_uuid' => $table->uuid,
            'diners' => 2,
            'lines' => [
                [
                    'uuid' => (string) Str::uuid(),
                    'product_uuid' => $product->uuid,
                    'quantity' => 2,
                    'price' => 1000,
                    'tax_percentage' => 10,
                ]
            ],
            'payment_method' => 'cash',
            'amount_cash' => 2000,
        ];

        $response = $this->postJson('/api/sales/process', $data);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'uuid',
            'ticket_number',
            'total',
            'payment_method',
            'lines'
        ]);
        
        $this->assertDatabaseHas('sales', [
            'restaurant_id' => $restaurant->id,
            'table_id' => $table->id,
            'total' => 2000,
        ]);
    }
}
