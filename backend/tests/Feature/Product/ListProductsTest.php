<?php

namespace Tests\Feature\Product;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ListProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products_with_pagination(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $user = EloquentUser::factory()->create([
            'restaurant_id' => $restaurant->id,
            'role' => 'operator',
        ]);

        EloquentProduct::factory()->count(15)->create([
            'restaurant_id' => $restaurant->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/products?page=1&per_page=10');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'uuid',
                    'name',
                    'priceInCents',
                    'stock',
                    'active'
                ]
            ],
            'meta' => [
                'total',
                'per_page',
                'current_page',
                'last_page'
            ]
        ]);
        
        $this->assertCount(10, $response->json('data'));
        $this->assertEquals(15, $response->json('meta.total'));
    }
}
