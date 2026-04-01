<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Application\UpdateUser\UpdateUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class PutController
{
    public function __construct(
        private UpdateUser $updateUser,
    ) {}

    public function __invoke(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email',
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|string|in:admin,supervisor,operator',
            'pin' => 'nullable|string|max:10',
        ]);

        try {
            ($this->updateUser)(
                $uuid,
                $validated['name'] ?? null,
                $validated['email'] ?? null,
                $validated['password'] ?? null,
                $validated['role'] ?? null,
                array_key_exists('pin', $validated) ? $validated['pin'] : false,
            );
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 400);
        }

        return new JsonResponse(['message' => 'User updated'], 200);
    }
}
