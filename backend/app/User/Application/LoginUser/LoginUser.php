<?php

namespace App\User\Application\LoginUser;

use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Shared\Domain\ValueObject\Email;
use App\User\Domain\Interfaces\PasswordHasherInterface;
use App\User\Domain\Interfaces\TokenGeneratorInterface;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use InvalidArgumentException;

class LoginUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private RestaurantRepositoryInterface $restaurantRepository,
        private PasswordHasherInterface $passwordHasher,
        private TokenGeneratorInterface $tokenGenerator,
    ) {}

    public function execute(string $plainEmail, string $plainPassword): LoginUserResponse
    {
        $email = Email::create($plainEmail);

        // Intentar buscar como usuario primero
        $user = $this->userRepository->findByEmail($email);

        if ($user !== null) {
            $isPasswordValid = $this->passwordHasher->verify($plainPassword, $user->passwordHash());

            if (! $isPasswordValid) {
                throw new InvalidArgumentException('Datos invalidos');
            }

            $token = $this->tokenGenerator->generate($user->id(), 'user');

            // Buscar el UUID del restaurante para el usuario
            $restaurant = $this->restaurantRepository->searchByInternalId($user->restaurantId()->value());
            $restaurantUuid = $restaurant?->id()->value();

            return LoginUserResponse::create(
                $token,
                $user->name(),
                $user->email()->value(),
                $user->role(),
                $restaurantUuid
            );
        }

        $restaurant = $this->restaurantRepository->findByEmail($email);

        if ($restaurant === null) {
            throw new InvalidArgumentException('Datos invalidos');
        }

        $isPasswordValid = $this->passwordHasher->verify($plainPassword, $restaurant->passwordHash());

        if (! $isPasswordValid) {
            throw new InvalidArgumentException('Datos invalidos');
        }

        $token = $this->tokenGenerator->generate($restaurant->id(), 'restaurant');

        return LoginUserResponse::create(
            $token,
            $restaurant->name(),
            $restaurant->email()->value(),
            'restaurant',
            $restaurant->id()->value()
        );
    }
}
