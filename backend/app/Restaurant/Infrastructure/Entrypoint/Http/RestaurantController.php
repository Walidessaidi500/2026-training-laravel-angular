<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\CreateRestaurant\CreateRestaurant;
use App\Restaurant\Application\DeleteRestaurant\DeleteRestaurant;
use App\Restaurant\Application\GetRestaurant\GetRestaurant;
use App\Restaurant\Application\ListRestaurants\ListRestaurants;
use App\Restaurant\Application\UpdateRestaurant\UpdateRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RestaurantController
{
    public function __construct(
        private CreateRestaurant $createRestaurant,
        private UpdateRestaurant $updateRestaurant,
        private DeleteRestaurant $deleteRestaurant,
        private ListRestaurants $listRestaurants,
        private GetRestaurant $getRestaurant,
    ) {}

    public function index(): JsonResponse
    {
        $restaurants = ($this->listRestaurants)();

        return new JsonResponse($restaurants, 200);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getRestaurant)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $response = ($this->createRestaurant)(
            $validated['name'],
            $validated['legal_name'],
            $validated['tax_id'],
            $validated['email'],
            $validated['password']
        );

        return new JsonResponse($response->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'legal_name' => ['required', 'string', 'max:255'],
            'tax_id' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        try {
            $response = ($this->updateRestaurant)(
                $uuid,
                $validated['name'],
                $validated['legal_name'],
                $validated['tax_id'],
                $validated['email']
            );

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteRestaurant)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
