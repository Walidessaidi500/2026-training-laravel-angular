<?php

namespace App\User\Application\DeleteUser;

use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use InvalidArgumentException;

final readonly class DeleteUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}

    public function __invoke(string $id): void
    {
        $userUuid = Uuid::create($id);

        $user = $this->userRepository->findById($userUuid);

        if ($user === null) {
            throw new InvalidArgumentException('User not found');
        }

        $this->userRepository->delete($userUuid);
    }
}
