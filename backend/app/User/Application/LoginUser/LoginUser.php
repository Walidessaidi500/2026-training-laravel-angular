<?php

namespace App\User\Application\LoginUser;

use App\Shared\Domain\ValueObject\Email;
use App\User\Domain\Interfaces\PasswordHasherInterface;
use App\User\Domain\Interfaces\TokenGeneratorInterface;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use InvalidArgumentException;

class LoginUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
        private TokenGeneratorInterface $tokenGenerator,
    ) {
    }

    public function execute(string $plainEmail, string $plainPassword): LoginUserResponse
    {
        $email = Email::create($plainEmail);

        $user = $this->userRepository->findByEmail($email);

        if ($user === null) {
            throw new InvalidArgumentException('Datos invalidos');
        }

        $isPasswordValid = $this->passwordHasher->verify($plainPassword, $user->PasswordHash());

        if (!$isPasswordValid) {
            throw new InvalidArgumentException('Datos invalidos');
        }

        $token = $this->tokenGenerator->generate($user);

        return LoginUserResponse::create(
            $token,
            $user->name(),
            $user->email()->value()
        );
    }
}
