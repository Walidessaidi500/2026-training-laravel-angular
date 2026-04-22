<?php

namespace App\User\Application\LoginUser;

class LoginUserResponse
{
    private function __construct(
        public readonly string $token,
        public readonly string $userName,
        public readonly string $userEmail,
        public readonly string $role,
        public readonly ?string $restaurantUuid = null,
    ) {}

    public static function create(string $token, string $userName, string $userEmail, string $role, ?string $restaurantUuid = null): self
    {
        return new self($token, $userName, $userEmail, $role, $restaurantUuid);
    }

    
    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'user_name' => $this->userName,
            'user_email' => $this->userEmail,
            'role' => $this->role,
            'restaurant_uuid' => $this->restaurantUuid,
        ];
    }
}
