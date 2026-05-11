<?php

namespace App\User\Application\ListUsers;

use App\User\Domain\Interfaces\UserRepositoryInterface;

final readonly class ListUsers
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}

    public function __invoke(int $page = 1, int $perPage = 15, ?int $restaurantId = null): ListUsersResponse
    {
        $paginator = $this->userRepository->list($page, $perPage, $restaurantId);

        return ListUsersResponse::create(
            $paginator->items(),
            [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }
}
