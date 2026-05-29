<?php

namespace Tests\Feature\Restaurant;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StoreRestaurantTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_restaurant_via_api(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $admin = EloquentUser::factory()->create([
            'role' => 'admin',
            'restaurant_id' => $restaurant->id,
        ]);
        Sanctum::actingAs($admin);

        $data = [
            'name' => 'Pizza Palace',
            'legal_name' => 'Pizza Palace S.L.',
            'tax_id' => 'B99999999',
            'email' => 'contact@pizzapalace.com',
            'password' => 'secret123',
        ];

        $response = $this->postJson('/api/restaurants', $data);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'name' => 'Pizza Palace',
            'legal_name' => 'Pizza Palace S.L.',
            'tax_id' => 'B99999999',
            'email' => 'contact@pizzapalace.com',
        ]);

        $this->assertDatabaseHas('restaurants', [
            'name' => 'Pizza Palace',
            'email' => 'contact@pizzapalace.com',
        ]);
    }
}
