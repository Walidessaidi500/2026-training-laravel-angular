<?php

namespace App\Tax\Infrastructure\Entrypoint\Http;

use App\Tax\Application\CreateTax\CreateTax;
use App\Tax\Application\DeleteTax\DeleteTax;
use App\Tax\Application\GetTax\GetTax;
use App\Tax\Application\ListTaxes\ListTaxes;
use App\Tax\Application\UpdateTax\UpdateTax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController
{
    public function __construct(
        private CreateTax $createTax,
        private UpdateTax $updateTax,
        private DeleteTax $deleteTax,
        private ListTaxes $listTaxes,
        private GetTax $getTax,
    ) {}

    public function index(): JsonResponse
    {
        return new JsonResponse(($this->listTaxes)(), 200);
    }

    public function show(string $uuid): JsonResponse
    {
        try {
            $response = ($this->getTax)($uuid);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'percentage' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $response = ($this->createTax)($validated['name'], $validated['percentage']);

        return new JsonResponse($response->toArray(), 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'percentage' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        try {
            $response = ($this->updateTax)($uuid, $validated['name'], $validated['percentage']);

            return new JsonResponse($response->toArray(), 200);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(string $uuid): JsonResponse
    {
        try {
            ($this->deleteTax)($uuid);

            return new JsonResponse(null, 204);
        } catch (\InvalidArgumentException $e) {
            return new JsonResponse(['message' => $e->getMessage()], 404);
        }
    }
}
