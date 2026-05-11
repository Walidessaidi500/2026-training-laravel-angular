<?php

namespace App\User\Domain\Interfaces;

use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Entity\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function save(User $user): void;

    public function findById(Uuid $id): ?User;

    public function findByEmail(Email $email): ?User;

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;

    public function delete(Uuid $id): void;
}
