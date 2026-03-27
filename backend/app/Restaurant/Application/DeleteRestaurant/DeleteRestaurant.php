<?php

namespace App\Restaurant\Application\DeleteRestaurant;

use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class DeleteRestaurant
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository,
    ) {}

    public function __invoke(string $uuid): void
    {
        $id = Uuid::create($uuid);
        $restaurant = $this->restaurantRepository->search($id);

        if (null === $restaurant) {
            throw new \InvalidArgumentException('Restaurante no encontrado');
        }

        $this->restaurantRepository->delete($id);
    }
}
