<?php

namespace App\Restaurant\Domain\ValueObject;

class RestaurantTaxId
{
    private string $value;

    private function __construct(string $value)
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new \InvalidArgumentException('El identificador fiscal no puede estar vacío');
        }

        if (mb_strlen($trimmed) > 20) {
            throw new \InvalidArgumentException('El identificador fiscal no puede superar 20 caracteres');
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
