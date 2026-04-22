<?php

namespace App\Table\Infrastructure\Entrypoint\Http;

use App\Table\Application\UpdateTable\UpdateTable;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UpdateTableController
{
    public function __construct(
        private UpdateTable $updateTable,
    ) {}

    public function __invoke(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'zone_id' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
        ]);

        try {
            return new JsonResponse(($this->updateTable)($uuid, $validated['zone_id'], $validated['name'])->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}