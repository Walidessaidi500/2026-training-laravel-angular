<?php

namespace App\User\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Uuid;

interface TokenGeneratorInterface
{
    public function generate(Uuid $id, string $type = 'user'): string;
}
