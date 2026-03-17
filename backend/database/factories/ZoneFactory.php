<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ZoneFactory extends Factory
{
    protected $model = \App\Zone\Infrastructure\Persistence\Models\EloquentZone::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->unique()->word(),
        ];
    }
}
