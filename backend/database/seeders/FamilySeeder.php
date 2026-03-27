<?php

namespace Database\Seeders;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use Illuminate\Database\Seeder;

class FamilySeeder extends Seeder
{
    public function run(): void
    {
        $families = [
            'Bebidas',
            'Cervezas',
            'Vinos',
            'Cafés e Infusiones',
            'Entrantes',
            'Carnes',
            'Pescados',
            'Postres',
        ];

        $restaurants = EloquentRestaurant::all();

        foreach ($restaurants as $restaurant) {
            foreach ($families as $name) {
                EloquentFamily::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'name' => $name,
                ]);
            }
        }
    }
}
