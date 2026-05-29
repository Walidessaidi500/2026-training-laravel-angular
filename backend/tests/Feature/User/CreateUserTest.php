<?php

namespace Tests\Feature\User;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_users_returns_201_and_user_json(): void
    {
        $restaurant = EloquentRestaurant::factory()->create();
        $admin = EloquentUser::factory()->create([
            'role' => 'admin',
            'restaurant_id' => $restaurant->id,
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/users', [
            'name' => 'Integration User',
            'email' => 'integration@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'operator',
            'restaurant_id' => $restaurant->id,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'uuid',
            'name',
            'email',
            'created_at',
            'updated_at',
        ]);
        $response->assertJson([
            'name' => 'Integration User',
            'email' => 'integration@example.com',
        ]);
        $this->assertMatchesRegularExpression(
            '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
            $response->json('uuid')
        );
    }
}
