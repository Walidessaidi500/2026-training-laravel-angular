<?php

namespace App\Product\Domain\ValueObject;

class Price
{
    private int $value;

    private function __construct(int $value)
    {
        if ($value < 0) {
            throw new \InvalidArgumentException('El precio no puede ser negativo');
        }

        $this->value = $value;
    }

    public static function create(int $cents): self
    {
        return new self($cents);
    }

    public function value(): int
    {
        return $this->value;
    }
}
