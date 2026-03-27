<?php

namespace Database\Factories;

use App\Order\Infrastructure\Persistence\Models\EloquentOrderLine;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderLineFactory extends Factory
{
    protected $model = EloquentOrderLine::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'restaurant_id' => null,
            'order_id' => null,
            'product_id' => null,
            'user_id' => null,
            'quantity' => fake()->numberBetween(1, 5),
            'price' => fake()->numberBetween(100, 5000),
            'tax_percentage' => fake()->randomElement([4, 10, 21]),
        ];
    }
}
