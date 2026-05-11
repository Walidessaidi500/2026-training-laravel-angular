<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Application\GetUser\GetUser;
use App\User\Application\ListUsers\ListUsers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class UserController
{
    public function __construct(
        private ListUsers $listUsers,
        private GetUser $getUser,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $response = ($this->listUsers)($page, $perPage, $restaurantId);

        return new JsonResponse($response->toArray(), 200);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getUser)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
