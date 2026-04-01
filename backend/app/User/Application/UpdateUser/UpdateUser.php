<?php

namespace App\User\Application\UpdateUser;

use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Interfaces\PasswordHasherInterface;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\User\Domain\ValueObject\PasswordHash;
use App\User\Domain\ValueObject\UserName;
use InvalidArgumentException;

final readonly class UpdateUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
    ) {
    }

    public function __invoke(
        string $id,
        ?string $name,
        ?string $emailStr,
        ?string $plainPassword,
        ?string $role,
        mixed $pin = false,
    ): void {
        $userUuid = Uuid::create($id);
        $user = $this->userRepository->findById($userUuid);

        if ($user === null) {
            throw new InvalidArgumentException('User not found');
        }

        $updatedName = $name !== null ? UserName::create($name) : UserName::create($user->name());
        $updatedEmail = $emailStr !== null ? Email::create($emailStr) : $user->email();
        $updatedRole = $role ?? $user->role();
        $updatedPin = $pin === false ? $user->pin() : $pin;

        $updatedPasswordHash = null;
        if ($plainPassword !== null) {
            $hashed = $this->passwordHasher->hash($plainPassword);
            $updatedPasswordHash = PasswordHash::create($hashed);
        }

        if ($emailStr !== null && $emailStr !== $user->email()->value()) {
            $existingUser = $this->userRepository->findByEmail($updatedEmail);
            if ($existingUser !== null && $existingUser->id()->value() !== $user->id()->value()) {
                throw new InvalidArgumentException('Email ya está en uso');
            }
        }

        $user->update($updatedName, $updatedEmail, $updatedRole, $updatedPasswordHash, $updatedPin);

        $this->userRepository->save($user);
    }
}
