<?php

namespace App\Table\Infrastructure\Entrypoint\Http;

use App\Table\Application\GetTable\GetTable;
use Illuminate\Http\JsonResponse;

class GetTableController
{
    public function __construct(
        private GetTable $getTable,
    ) {}

    public function __invoke(string $uuid): JsonResponse
    {
        try {
            return new JsonResponse(($this->getTable)($uuid)->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}