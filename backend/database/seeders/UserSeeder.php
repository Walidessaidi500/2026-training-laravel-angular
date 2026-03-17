<?php

namespace Database\Seeders;

use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin principal
        EloquentUser::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@tpv.com',
        ]);

        // Supervisor
        EloquentUser::factory()->supervisor()->create([
            'name' => 'María García',
            'email' => 'maria@tpv.com',
        ]);

        // Operadores (camareros)
        EloquentUser::factory()->create([
            'name' => 'Carlos López',
            'email' => 'carlos@tpv.com',
        ]);

        EloquentUser::factory()->create([
            'name' => 'Laura Martínez',
            'email' => 'laura@tpv.com',
        ]);

        EloquentUser::factory()->create([
            'name' => 'Pedro Sánchez',
            'email' => 'pedro@tpv.com',
        ]);
    }
}
