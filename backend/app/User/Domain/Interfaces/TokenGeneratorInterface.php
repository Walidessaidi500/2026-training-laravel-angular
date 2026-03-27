<?php

namespace App\User\Domain\Interfaces;

use App\User\Domain\Entity\User;

interface TokenGeneratorInterface
{
    /* Esto lo que hace es generar un token de acceso para el usuario */
    public function generate(User $user): string;
}
