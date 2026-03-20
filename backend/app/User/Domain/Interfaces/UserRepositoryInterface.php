<?php

namespace App\User\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Email;
use App\User\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findById(string $id): ?User;

    public function findByEmail(Email $email): ?User;
}
