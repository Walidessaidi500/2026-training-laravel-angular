<?php

namespace App\Tax\Domain\ValueObject;

class TaxName
{
    private string $value;

    private function __construct(string $value)
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new \InvalidArgumentException('El nombre del impuesto no puede estar vacío');
        }

        if (mb_strlen($trimmed) > 255) {
            throw new \InvalidArgumentException('El nombre del impuesto no puede superar 255 caracteres');
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
