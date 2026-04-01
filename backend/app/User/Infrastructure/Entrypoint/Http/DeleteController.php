<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Application\DeleteUser\DeleteUser;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class DeleteController
{
    public function __construct(
        private DeleteUser $deleteUser,
    ) {}

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            ($this->deleteUser)($uuid);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }

        return new JsonResponse(['message' => 'User deleted'], 200);
    }
}
