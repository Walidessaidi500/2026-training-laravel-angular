<?php

namespace App\User\Application\ListUsers;

use App\User\Domain\Entity\User;

final readonly class ListUsersResponse
{
    private function __construct(
        public array $data,
        public array $meta,
    ) {}

    public static function create(array $users, array $meta): self
    {
        $data = array_map(function (User $user) {
            return [
                'id' => $user->id()->value(),
                'uuid' => $user->id()->value(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'role' => $user->role(),
                'restaurant_id' => $user->restaurantId()->value(),
                'created_at' => $user->createdAt()->format(\DateTimeInterface::ATOM),
                'updated_at' => $user->updatedAt()->format(\DateTimeInterface::ATOM),
                'pin' => $user->pin(),
            ];
        }, $users);

        return new self($data, $meta);
    }

    public function toArray(): array
    {
        return [
            'data' => $this->data,
            'meta' => $this->meta,
        ];
    }
}
