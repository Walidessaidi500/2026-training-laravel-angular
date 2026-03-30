<?php

namespace App\User\Application\GetAuthenticatedUser;

class GetAuthenticatedUserResponse
{
    private function __construct(
        public readonly string $uuid,
        public readonly string $name,
        public readonly string $email,
        public readonly string $role,
        public readonly ?int $restaurantId,
    ) {}

    public static function create(
        string $uuid,
        string $name,
        string $email,
        string $role,
        ?int $restaurantId,
    ): self {
        return new self($uuid, $name, $email, $role, $restaurantId);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'restaurant_id' => $this->restaurantId,
        ];
    }
}
