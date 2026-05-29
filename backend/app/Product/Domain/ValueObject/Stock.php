<?php

namespace App\Product\Domain\ValueObject;

class Stock
{
    private float $value;

    private function __construct(float $value)
    {
        if ($value < 0) {
            throw new \InvalidArgumentException('El stock no puede ser negativo');
        }

        $this->value = $value;
    }

    public static function create(float $value): self
    {
        return new self($value);
    }

    public function value(): float
    {
        return $this->value;
    }
}
