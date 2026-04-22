<?php

namespace App\Restaurant\Infrastructure\Entrypoint\Http;

use App\Restaurant\Application\UpdateRestaurant\UpdateRestaurant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UpdateRestaurantController
{
    public function __construct(
        private UpdateRestaurant $updateRestaurant
    ){}

    public function __invoke(Request $request, string $uuid):JsonResponse{
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
}