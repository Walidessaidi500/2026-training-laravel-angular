<?php

namespace App\User\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Entity\User;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findById(Uuid $id): ?User;

    public function findByEmail(Email $email): ?User;

    public function delete(Uuid $id): void;
}
