<?php

namespace App\Tax\Infrastructure\Entrypoint\Http;

use App\Tax\Application\GetTax\GetTax;
use Illuminate\Http\JsonResponse;


class GetTaxController
{
    public function __construct(
        private GetTax $getTax,
    ) {}

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getTax)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}