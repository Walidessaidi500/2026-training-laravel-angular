<?php

namespace App\Product\Domain\ValueObject;

class ProductName
{
    private string $value;

    private function __construct(string $value)
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new \InvalidArgumentException('El nombre del producto no puede estar vacío');
        }

        if (mb_strlen($trimmed) > 100) {
            throw new \InvalidArgumentException('El nombre del producto no puede superar 100 caracteres');
        }

        $this->value = $trimmed;
    }

    public static function create(string $value): self
    {
        return new self($value);
    }

    public function value(): string
    {
        return $this->value;
    }
}
