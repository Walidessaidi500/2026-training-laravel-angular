<?php

namespace App\Tax\Infrastructure\Entrypoint\Http;

use App\Tax\Application\DeleteTax\DeleteTax;
use Illuminate\Http\JsonResponse;

class DeleteTaxController
{
    public function __construct(
        private DeleteTax $deleteTax,
    ) {}

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            ($this->deleteTax)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}