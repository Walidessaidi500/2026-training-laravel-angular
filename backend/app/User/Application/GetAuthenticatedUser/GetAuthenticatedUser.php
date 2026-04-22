<?php

namespace App\User\Application\GetAuthenticatedUser;

use Illuminate\Contracts\Auth\Authenticatable;

class GetAuthenticatedUser
{
    public function execute(Authenticatable $user): GetAuthenticatedUserResponse
    {
        return GetAuthenticatedUserResponse::create(
            uuid: $user->uuid,
            name: $user->name,
            email: $user->email,
            role: $user->role,
            restaurantId: $user->restaurant_id,
        );
    }
}
