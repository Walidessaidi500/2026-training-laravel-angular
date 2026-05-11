<?php

namespace App\User\Application\GetUser;

use App\User\Domain\Entity\User;

final readonly class GetUserResponse
{
    private function __construct(
        public string $id,
        public string $name,
        public string $email,
        public string $role,
        public int $restaurantId,
        public string $createdAt,
        public string $updatedAt,
        public ?string $pin = null,
    ) {}

    public static function create(User $user): self
    {
        return new self(
            id: $user->id()->value(),
            name: $user->name(),
            email: $user->email()->value(),
            role: $user->role(),
            restaurantId: $user->restaurantId()->value(),
            createdAt: $user->createdAt()->format(\DateTimeInterface::ATOM),
            updatedAt: $user->updatedAt()->format(\DateTimeInterface::ATOM),
            pin: $user->pin(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'restaurant_id' => $this->restaurantId,
            'pin' => $this->pin,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
