<?php

namespace Tests\Feature\User;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GetMeTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_me_returns_user_data_with_restaurant_info(): void
    {
        $restaurant = EloquentRestaurant::factory()->create([
            'name' => 'Restaurante Test',
            'legal_name' => 'Legal Test S.L.',
        ]);

        $user = EloquentUser::factory()->create([
            'restaurant_id' => $restaurant->id,
            'role' => 'supervisor',
            'name' => 'Test User',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/me');

        $response->assertStatus(200);
        $response->assertJson([
            'uuid' => $user->uuid,
            'name' => 'Test User',
            'role' => 'supervisor',
            'restaurant_id' => $restaurant->id,
            'restaurant_uuid' => $restaurant->uuid,
            'restaurant_name' => 'Restaurante Test',
            'restaurant_legal_name' => 'Legal Test S.L.',
        ]);
    }
}
