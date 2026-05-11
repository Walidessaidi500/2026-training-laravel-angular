<?php

namespace App\User\Application\GetUser;

use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use InvalidArgumentException;

final readonly class GetUser
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}

    public function __invoke(string $id): GetUserResponse
    {
        $userUuid = Uuid::create($id);
        $user = $this->userRepository->findById($userUuid);

        if ($user === null) {
            throw new InvalidArgumentException('User not found');
        }

        return GetUserResponse::create($user);
    }
}
