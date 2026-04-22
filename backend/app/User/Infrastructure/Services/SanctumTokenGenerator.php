<?php

namespace App\User\Infrastructure\Services;

use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Interfaces\TokenGeneratorInterface;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;

class SanctumTokenGenerator implements TokenGeneratorInterface
{
    public function generate(Uuid $id, string $type = 'user'): string
    {
        if ($type === 'restaurant') {
            $model = EloquentRestaurant::where('uuid', $id->value())->firstOrFail();
        } else {
            $model = EloquentUser::where('uuid', $id->value())->firstOrFail();
        }

        $model->tokens()->delete();

        return $model->createToken('auth-token')->plainTextToken;
    }
}
