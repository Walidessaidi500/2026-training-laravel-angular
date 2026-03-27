<?php

namespace Database\Factories;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = EloquentProduct::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'family_id' => null,
            'tax_id' => null,
            'image_src' => null,
            'name' => fake()->unique()->word(),
            'price' => fake()->numberBetween(100, 2500),
            'stock' => fake()->numberBetween(10, 200),
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
