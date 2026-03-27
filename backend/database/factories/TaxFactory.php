<?php

namespace Database\Factories;

use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TaxFactory extends Factory
{
    protected $model = EloquentTax::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'name' => fake()->unique()->word(),
            'percentage' => fake()->randomElement([4, 10, 21]),
        ];
    }
}
