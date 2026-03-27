<?php

namespace Database\Factories;

use App\Sale\Infrastructure\Persistence\Models\EloquentSaleLine;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SaleLineFactory extends Factory
{
    protected $model = EloquentSaleLine::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'sale_id' => null,
            'product_id' => null,
            'user_id' => null,
            'quantity' => fake()->numberBetween(1, 5),
            'price' => fake()->numberBetween(100, 2500),
            'tax_percentage' => 10,
        ];
    }
}
