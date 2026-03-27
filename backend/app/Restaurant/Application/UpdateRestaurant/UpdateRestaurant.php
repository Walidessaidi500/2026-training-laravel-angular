<?php

namespace App\Restaurant\Application\UpdateRestaurant;

use App\Restaurant\Application\Shared\RestaurantResponse;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Restaurant\Domain\ValueObject\LegalName;
use App\Restaurant\Domain\ValueObject\RestaurantName;
use App\Restaurant\Domain\ValueObject\RestaurantTaxId;
use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;

class UpdateRestaurant
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository,
    ) {}

    public function __invoke(
        string $uuid,
        string $name,
        string $legalName,
        string $taxId,
        string $email,
    ): RestaurantResponse {
        $restaurant = $this->restaurantRepository->search(Uuid::create($uuid));

        if ($restaurant === null) {
            throw new \InvalidArgumentException('Restaurante no encontrado');
        }

        $restaurant->update(
            RestaurantName::create($name),
            LegalName::create($legalName),
            RestaurantTaxId::create($taxId),
            Email::create($email)
        );

        $this->restaurantRepository->save($restaurant);

        return RestaurantResponse::create($restaurant);
    }
}
