<?php

namespace App\User\Application\LoginUser;

class LoginUserResponse
{
    private function __construct(
        public readonly string $token,
        public readonly string $userName,
        public readonly string $userEmail,
    ) {}

    public static function create(string $token, string $userName, string $userEmail): self
    {
        return new self($token, $userName, $userEmail);
    }

    
    public function toArray(): array
    {
        return [
            'token' => $this->token,
            'user_name' => $this->userName,
            'user_email' => $this->userEmail,
        ];
    }
}
