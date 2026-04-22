<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Application\ToggleFamilyActive\ToggleFamilyActive;
use Illuminate\Http\JsonResponse;

class ToggleFamilyController {
    public function __construct(
        private ToggleFamilyActive $toggleFamilyActive
    ){}

    public function __invoke(string $uuid):JsonResponse{
        try {
            $resoponse = ($this->toggleFamilyActive)($uuid);

            return new JsonResponse($resoponse->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}