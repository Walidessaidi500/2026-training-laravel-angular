<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\DeleteRestaurant\DeleteRestaurant;
use Illuminate\Http\JsonResponse;

class DeleteRestaurantController
{
    public function __construct(
        private DeleteRestaurant $deleteRestaurant
    ){}

    public function __invoke(string $uuid):JsonResponse{
        try {
            ($this->deleteRestaurant)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}