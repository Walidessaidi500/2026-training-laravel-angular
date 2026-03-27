<?php

namespace App\Restaurant\Application\ListRestaurants;

use App\Restaurant\Application\Shared\RestaurantResponse;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;

class ListRestaurants
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository,
    ) {}

    /** @return array<int, array<string, mixed>> */
    public function __invoke(): array
    {
        $restaurants = $this->restaurantRepository->all();

        return array_map(
            fn ($restaurant) => RestaurantResponse::create($restaurant)->toArray(),
            $restaurants
        );
    }
}
