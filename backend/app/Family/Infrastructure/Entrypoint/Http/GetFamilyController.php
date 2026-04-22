<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\GetFamily\GetFamily;
use Illuminate\Http\JsonResponse;

class GetFamilyController{
    public function __construct(
        private GetFamily $getFamily
    ) {
    }

    public function __invoke(string $uuid):JsonResponse
    {
        try {
            $response = ($this->getFamily)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}