<?php

namespace Database\Factories;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FamilyFactory extends Factory
{
    protected $model = EloquentFamily::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'restaurant_id' => 1,
            'name' => fake()->unique()->word(),
            'active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'active' => false,
        ]);
    }
}
