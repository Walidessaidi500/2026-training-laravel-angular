<?php

namespace App\User\Application\CreateUser;

use App\User\Domain\Entity\User;

final readonly class CreateUserResponse
{
    private function __construct(
        public string $id,
        public string $name,
        public string $email,
        public string $role,
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
            'pin' => $this->pin,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
