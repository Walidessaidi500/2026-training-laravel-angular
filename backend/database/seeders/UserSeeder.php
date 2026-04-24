<?php

namespace Database\Seeders;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = EloquentRestaurant::all();

        foreach ($restaurants as $restaurant) {
            // Admin específico para Los Gomez si es el caso
            if ($restaurant->name === 'Los Gomez') {
                EloquentUser::factory()->admin()->create([
                    'restaurant_id' => $restaurant->id,
                    'name' => 'Admin Yurest',
                    'email' => 'admin@yurest.com',
                    'pin' => '1234',
                ]);
            }

            // Admin principal
            EloquentUser::factory()->admin()->create([
                'restaurant_id' => $restaurant->id,
                'name' => 'Admin - '.$restaurant->name,
                'email' => 'admin-'.$restaurant->id.'@tpv.com',
                'pin' => '1111',
            ]);

            // Supervisor
            EloquentUser::factory()->supervisor()->create([
                'restaurant_id' => $restaurant->id,
                'name' => 'María García',
                'email' => 'maria-'.$restaurant->id.'@tpv.com',
                'pin' => '2345',
            ]);

            // Operadores (camareros)
            EloquentUser::factory()->create([
                'restaurant_id' => $restaurant->id,
                'name' => 'Carlos López',
                'email' => 'carlos-'.$restaurant->id.'@tpv.com',
                'pin' => '3456',
            ]);

            EloquentUser::factory()->create([
                'restaurant_id' => $restaurant->id,
                'name' => 'Laura Martínez',
                'email' => 'laura-'.$restaurant->id.'@tpv.com',
                'pin' => '4567',
            ]);

            EloquentUser::factory()->create([
                'restaurant_id' => $restaurant->id,
                'name' => 'Pedro Sánchez',
                'email' => 'pedro-'.$restaurant->id.'@tpv.com',
                'pin' => '5678',
            ]);
        }
    }
}
