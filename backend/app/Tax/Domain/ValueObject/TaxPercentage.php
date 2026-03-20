<?php

namespace App\Tax\Domain\ValueObject;

class TaxPercentage
{
    private int $value;

    private function __construct(int $value)
    {
        if ($value < 0 || $value > 100) {
            throw new \InvalidArgumentException('El porcentaje debe estar entre 0 y 100');
        }

        $this->value = $value;
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
