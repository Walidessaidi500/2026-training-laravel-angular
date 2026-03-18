<?php

namespace App\User\Domain\Interfaces;

use App\User\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findById(string $id): ?User;

    /*Esto lo que hace es buscar un usuario por su correo electronico*/
    public function findByEmail(Email $email): ?User;
}
