<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SaleFactory extends Factory
{
    protected $model = \App\Sale\Infrastructure\Persistence\Models\EloquentSale::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'ticket_number' => null,
            'status' => 'open',
            'table_id' => null,
            'opened_by_user_id' => null,
            'closed_by_user_id' => null,
            'diners' => fake()->numberBetween(1, 8),
            'opened_at' => now(),
            'closed_at' => null,
            'total' => 0,
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
