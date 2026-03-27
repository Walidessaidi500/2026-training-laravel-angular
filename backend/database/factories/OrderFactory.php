<?php

namespace Database\Factories;

use App\Order\Infrastructure\Persistence\Models\EloquentOrder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class OrderFactory extends Factory
{
    protected $model = EloquentOrder::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'restaurant_id' => null,
            'status' => 'open',
            'table_id' => null,
            'opened_by_user_id' => null,
            'closed_by_user_id' => null,
            'diners' => fake()->numberBetween(1, 8),
            'opened_at' => now(),
            'closed_at' => null,
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }
}
