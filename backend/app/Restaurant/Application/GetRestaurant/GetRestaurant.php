<?php

namespace App\Restaurant\Application\GetRestaurant;

use App\Restaurant\Application\Shared\RestaurantResponse;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Shared\Domain\ValueObject\Uuid;

class GetRestaurant
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository,
    ) {}

    public function __invoke(string $uuid): RestaurantResponse
    {
        $restaurant = $this->restaurantRepository->search(Uuid::create($uuid));

        if (null === $restaurant) {
            throw new \InvalidArgumentException('Restaurante no encontrado');
        }

        return RestaurantResponse::create($restaurant);
    }
}
