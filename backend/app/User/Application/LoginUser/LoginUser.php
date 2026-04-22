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

            // Necesitamos el UUID del restaurante para el usuario
            // El User domain entity tiene restaurantId() que es un ValueObject de int ID
            // Pero el frontend prefiere el UUID. 
            // Por simplicidad, si es un usuario, buscaremos el UUID del restaurante si es necesario
            // o simplemente devolvemos el role.
            
            // Para encontrar el UUID del restaurante, necesitaríamos inyectar un RestaurantRepository o similar
            // Pero el User entity parece que solo guarda el ID entero de la BD (Legacy? o DDD decision)
            // Vamos a ver si el User domain entity tiene el uuid del restaurante.
            // No, tiene RestaurantId que parece ser un int.
            
            return LoginUserResponse::create(
                $token,
                $user->name(),
                $user->email()->value(),
                $user->role()
            );
        }

        // Si no es usuario, intentar como restaurante
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
