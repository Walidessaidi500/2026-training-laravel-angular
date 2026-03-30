<?php

namespace App\Sale\Infrastructure\Entrypoint\Http;

use App\Sale\Infrastructure\Persistence\Models\EloquentSale;
use App\Sale\Infrastructure\Persistence\Repositories\EloquentSaleRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SaleController
{
    public function __construct(private EloquentSaleRepository $saleRepository) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $sales = $this->saleRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
                'last_page' => $sales->lastPage(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find($uuid);

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        return response()->json($sale);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'order_id' => 'required|integer|exists:orders,id',
            'user_id' => 'required|integer|exists:users,id',
            'opened_by_user_id' => 'required|integer|exists:users,id',
            'total' => 'required|integer|min:0',
        ]);

        $sale = EloquentSale::create([
            'uuid' => Str::uuid()->toString(),
            'restaurant_id' => $validated['restaurant_id'],
            'order_id' => $validated['order_id'],
            'user_id' => $validated['user_id'],
            'opened_by_user_id' => $validated['opened_by_user_id'],
            'total' => $validated['total'],
            'opened_at' => now(),
        ]);

        return response()->json($sale, 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find($uuid);

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        $validated = $request->validate([
            'total' => 'integer|min:0',
            'closed_by_user_id' => 'nullable|integer|exists:users,id',
        ]);

        if (isset($validated['total'])) {
            $sale->total = $validated['total'];
        }

        if (isset($validated['closed_by_user_id'])) {
            $sale->closed_by_user_id = $validated['closed_by_user_id'];
            $sale->closed_at = now();
        }

        $this->saleRepository->save($sale);

        return response()->json($sale);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find($uuid);

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        $this->saleRepository->delete($sale);

        return response()->json(['message' => 'Sale deleted']);
    }

    public function close(string $uuid): JsonResponse
    {
        $sale = $this->saleRepository->find($uuid);

        if (! $sale) {
            return response()->json(['message' => 'Sale not found'], 404);
        }

        $sale->closed_by_user_id = auth()->id();
        $sale->closed_at = now();

        $this->saleRepository->save($sale);

        return response()->json($sale);
    }
}
