<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TableFactory extends Factory
{
    protected $model = \App\Zone\Infrastructure\Persistence\Models\EloquentTable::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'zone_id' => null,
            'name' => 'Mesa ' . fake()->unique()->numberBetween(1, 100),
        ];
    }
}
