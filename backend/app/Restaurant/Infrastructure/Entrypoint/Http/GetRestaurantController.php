<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\GetRestaurant\GetRestaurant;
use Illuminate\Http\JsonResponse;

class GetRestaurantController
{
public function __construct(
    private GetRestaurant $getRestaurant
) {}

public function __invoke(string $uuid): JsonResponse
{
    try {
        $response = ($this->getRestaurant)($uuid);

        return new JsonResponse($response->toArray(), 200);
    } catch (\InvalidArgumentException $e) {
        return new JsonResponse(['message' => $e->getMessage()], 404);
    }
}
}