<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\DeleteFamily\DeleteFamily;
use Illuminate\Http\JsonResponse;

class DeleteFamilyController
{
    public function __construct(
        private DeleteFamily $deleteFamily
    ) {
    }

    public function __invoke(string $uuid):JsonResponse
    {
        try {
            ($this->deleteFamily)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}