<?php

namespace App\Product\Infrastructure\Entrypoint\Http;

use App\Product\Application\ToggleProductActive\ToggleProductActive;
use Illuminate\Http\JsonResponse;


class ToggleProductController
{
public function __construct(
    private ToggleProductActive $toggleProductActive
){}

public function __invoke(string $uuid): JsonResponse
{
    try {
        $response = ($this->toggleProductActive)($uuid);

        return new JsonResponse($response->toArray(), 200);
    } catch (\InvalidArgumentException $e){
        return new JsonResponse(['message' => $e->getMessage()], 404);
    }
}
}