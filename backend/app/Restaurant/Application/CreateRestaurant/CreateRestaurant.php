<?php

namespace App\Restaurant\Application\CreateRestaurant;

use App\Restaurant\Application\Shared\RestaurantResponse;
use App\Restaurant\Domain\Entity\Restaurant;
use App\Restaurant\Domain\Interfaces\PasswordHasherInterface;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Restaurant\Domain\ValueObject\LegalName;
use App\Restaurant\Domain\ValueObject\PasswordHash;
use App\Restaurant\Domain\ValueObject\RestaurantName;
use App\Restaurant\Domain\ValueObject\RestaurantTaxId;
use App\Shared\Domain\ValueObject\Email;

class CreateRestaurant
{
    public function __construct(
        private RestaurantRepositoryInterface $restaurantRepository,
        private PasswordHasherInterface $passwordHasher,
    ) {}

    public function __invoke(
        string $name,
        string $legalName,
        string $taxId,
        string $email,
        string $plainPassword,
    ): RestaurantResponse {
        $restaurant = Restaurant::dddCreate(
            RestaurantName::create($name),
            LegalName::create($legalName),
            RestaurantTaxId::create($taxId),
            Email::create($email),
            PasswordHash::create($this->passwordHasher->hash($plainPassword))
        );

        $this->restaurantRepository->save($restaurant);

        return RestaurantResponse::create($restaurant);
    }
}
