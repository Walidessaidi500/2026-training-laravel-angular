<?php

namespace Database\Seeders;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Zone\Infrastructure\Persistence\Models\EloquentTable;
use App\Zone\Infrastructure\Persistence\Models\EloquentZone;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            'Salón Principal' => 8,
            'Terraza' => 6,
            'Barra' => 4,
            'Salón Privado' => 3,
        ];

        $restaurants = EloquentRestaurant::all();

        foreach ($restaurants as $restaurant) {
            $tableCounter = 1;

            foreach ($zones as $zoneName => $tableCount) {
                $zone = EloquentZone::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'name' => $zoneName,
                ]);

                for ($i = 1; $i <= $tableCount; $i++) {
                    EloquentTable::factory()->create([
                        'restaurant_id' => $restaurant->id,
                        'zone_id' => $zone->id,
                        'name' => 'Mesa '.$tableCounter,
                    ]);
                    $tableCounter++;
                }
            }
        }
    }
}
