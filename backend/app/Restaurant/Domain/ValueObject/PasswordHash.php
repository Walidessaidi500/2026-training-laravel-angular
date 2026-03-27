<?php

namespace App\Restaurant\Domain\ValueObject;

class PasswordHash
{
    private const MIN_LENGTH = 60;

    private const MAX_LENGTH = 255;

    private string $value;

    private function __construct(string $value)
    {
        $length = strlen($value);
        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            throw new \InvalidArgumentException(
                sprintf('El hash de la contraseña debe tener entre %d y %d caracteres.', self::MIN_LENGTH, self::MAX_LENGTH)
            );
        }
        $this->value = $value;
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
