<?php

namespace Database\Seeders;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
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

        foreach ($families as $name) {
            EloquentFamily::factory()->create(['name' => $name]);
        }
    }
}
