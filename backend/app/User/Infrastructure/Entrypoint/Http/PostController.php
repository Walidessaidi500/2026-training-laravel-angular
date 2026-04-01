<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Application\CreateUser\CreateUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController
{
    public function __construct(
        private CreateUser $createUser,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', 'string', 'in:admin,supervisor,operator'],
            'pin' => ['nullable', 'string', 'max:10'],
        ]);

        // Obtener restaurant_id del usuario autenticado
        $authenticatedUser = $request->user();

        if (! $authenticatedUser || ! $authenticatedUser->restaurant_id) {
            return new JsonResponse(['message' => 'Usuario no autenticado o sin restaurante asignado'], 401);
        }

        $role = $validated['role'] ?? 'operator';

        $response = ($this->createUser)(
            $validated['email'],
            $validated['name'],
            $validated['password'],
            $authenticatedUser->restaurant_id,
            $role,
            $validated['pin'] ?? null
        );

        return new JsonResponse($response->toArray(), 201);
    }
}
