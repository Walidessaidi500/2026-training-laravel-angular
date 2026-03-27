<?php

namespace App\Restaurant\Domain\ValueObject;

class LegalName
{
    private string $value;

    private function __construct(string $value)
    {
        $trimmed = trim($value);

        if ($trimmed === '') {
            throw new \InvalidArgumentException('El nombre legal no puede estar vacío');
        }

        if (mb_strlen($trimmed) > 255) {
            throw new \InvalidArgumentException('El nombre legal no puede superar 255 caracteres');
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
