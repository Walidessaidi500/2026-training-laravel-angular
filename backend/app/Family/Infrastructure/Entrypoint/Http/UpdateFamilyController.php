<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\UpdateFamily\UpdateFamily;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class UpdateFamilyController{
    public function __construct(
        private UpdateFamily $updateFamily
    ){}

    public function __invoke(Request $request, string $uuid):JsonResponse{
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'active' => ['required', 'boolean'],
        ]);

        try {
            $response = ($this->updateFamily)($uuid, $validated['name'], (bool) $validated['active']);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}