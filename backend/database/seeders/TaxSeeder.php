<?php

namespace Database\Seeders;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    public function run(): void
    {
        $taxes = [
            ['name' => 'IVA Super Reducido', 'percentage' => 4],
            ['name' => 'IVA Reducido', 'percentage' => 10],
            ['name' => 'IVA General', 'percentage' => 21],
        ];

        $restaurants = EloquentRestaurant::all();

        foreach ($restaurants as $restaurant) {
            foreach ($taxes as $tax) {
                EloquentTax::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'name' => $tax['name'],
                    'percentage' => $tax['percentage'],
                ]);
            }
        }
    }
}
