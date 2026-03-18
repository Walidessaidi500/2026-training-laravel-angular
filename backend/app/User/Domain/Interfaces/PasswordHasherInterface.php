<?php

namespace App\User\Domain\Interfaces;

interface PasswordHasherInterface
{
    public function hash(string $plainPassword): string;

    /*Verifica si una contraseña en texto plano coincide con su version hasheada*/
    public function verify(string $plainPassword, string $hashedPassword): bool;

}
