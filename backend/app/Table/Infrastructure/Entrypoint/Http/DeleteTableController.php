<?php

namespace App\Table\Infrastructure\Entrypoint\Http;

use App\Table\Application\DeleteTable\DeleteTable;
use Illuminate\Http\JsonResponse;

class DeleteTableController
{
    public function __construct(
        private DeleteTable $deleteTable,
    ) {}

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            ($this->deleteTable)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
