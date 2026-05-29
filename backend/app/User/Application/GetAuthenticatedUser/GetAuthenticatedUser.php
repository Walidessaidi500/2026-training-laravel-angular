<?php

namespace App\User\Application\GetAuthenticatedUser;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\DB;

class GetAuthenticatedUser
{
    public function execute(Authenticatable $user): GetAuthenticatedUserResponse
    {
        $restaurant = $user->restaurant_id 
            ? DB::table('restaurants')->where('id', $user->restaurant_id)->first()
            : null;

        return GetAuthenticatedUserResponse::create(
            uuid: $user->uuid,
            name: $user->name,
            email: $user->email,
            role: $user->role,
            restaurantId: $user->restaurant_id,
            restaurantUuid: $restaurant?->uuid,
            restaurantName: $restaurant?->name,
            restaurantLegalName: $restaurant?->legal_name
        );
    }
}
