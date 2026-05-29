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
        public readonly ?string $restaurantUuid = null,
        public readonly ?string $restaurantName = null,
        public readonly ?string $restaurantLegalName = null,
    ) {}

    public static function create(
        string $uuid,
        string $name,
        string $email,
        string $role,
        ?int $restaurantId,
        ?string $restaurantUuid = null,
        ?string $restaurantName = null,
        ?string $restaurantLegalName = null,
    ): self {
        return new self($uuid, $name, $email, $role, $restaurantId, $restaurantUuid, $restaurantName, $restaurantLegalName);
    }

    public function toArray(): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'restaurant_id' => $this->restaurantId,
            'restaurant_uuid' => $this->restaurantUuid,
            'restaurant_name' => $this->restaurantName,
            'restaurant_legal_name' => $this->restaurantLegalName,
        ];
    }
}
