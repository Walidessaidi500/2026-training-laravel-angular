<?php

namespace App\User\Application\GetAuthenticatedUser;

use App\User\Infrastructure\Persistence\Models\EloquentUser;

class GetAuthenticatedUser
{
    public function execute(EloquentUser $user): GetAuthenticatedUserResponse
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
