<?php

namespace Database\Seeders;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            [
                'name' => 'La Taberna del Puerto',
                'legal_name' => 'Taberna del Puerto S.L.',
                'tax_id' => 'B12345678',
                'email' => 'taberna@example.com',
            ],
            [
                'name' => 'El Rincón Mediterráneo',
                'legal_name' => 'Rincón Mediterráneo S.L.',
                'tax_id' => 'B87654321',
                'email' => 'rincon@example.com',
            ],
            [
                'name' => 'Pizzería Bella Napoli',
                'legal_name' => 'Bella Napoli S.L.',
                'tax_id' => 'B11223344',
                'email' => 'napoli@example.com',
            ],
        ];

        foreach ($restaurants as $data) {
            EloquentRestaurant::create([
                'uuid' => Str::uuid()->toString(),
                'name' => $data['name'],
                'legal_name' => $data['legal_name'],
                'tax_id' => $data['tax_id'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
            ]);
        }
    }
}
