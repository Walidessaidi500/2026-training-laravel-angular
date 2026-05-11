<?php

namespace App\Restaurant\Domain\Interfaces;

use App\Restaurant\Domain\Entity\Restaurant;
use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;

interface RestaurantRepositoryInterface
{
    public function save(Restaurant $restaurant): void;

    public function search(Uuid $id): ?Restaurant;

    public function searchByInternalId(int $id): ?Restaurant;

    public function findByEmail(Email $email): ?Restaurant;

    public function delete(Uuid $id): void;

    public function all(): array;
}
