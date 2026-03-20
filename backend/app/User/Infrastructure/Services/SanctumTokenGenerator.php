<?php

namespace App\User\Infrastructure\Services;

use App\User\Domain\Entity\User;
use App\User\Domain\Interfaces\TokenGeneratorInterface;
use App\User\Infrastructure\Persistence\Models\EloquentUser;

class SanctumTokenGenerator implements TokenGeneratorInterface
{
    public function generate(User $user): string
    {
        $eloquentUser = EloquentUser::where('uuid', $user->id()->value())->firstOrFail();

        $eloquentUser->tokens()->delete();

        return $eloquentUser->createToken('auth-token')->plainTextToken;
    }
}
