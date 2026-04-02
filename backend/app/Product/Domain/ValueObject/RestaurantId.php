<?php

namespace App\Product\Domain\ValueObject;

class RestaurantId
{
    private function __construct(
        private int $value,
    ) {
        if ($value <= 0) {
            throw new \InvalidArgumentException('El ID del restaurante debe ser mayor a 0');
        }
    }

    public static function create(int $value): self
    {
        return new self($value);
    }

    public function value(): int
    {
        return $this->value;
    }
}
