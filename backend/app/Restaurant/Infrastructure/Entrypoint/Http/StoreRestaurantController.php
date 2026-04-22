<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\CreateRestaurant\CreateRestaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class StoreRestaurantController
{
    public function __construct(
        private CreateRestaurant $createRestaurant
    ){}

    public function __invoke(Request $request):JsonResponse
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
}