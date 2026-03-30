<?php

namespace App\Sale\Infrastructure\Persistence\Repositories;

use App\Sale\Infrastructure\Persistence\Models\EloquentSale;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentSaleRepository
{
    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        $query = EloquentSale::query();

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(string $uuid): ?EloquentSale
    {
        return EloquentSale::where('uuid', $uuid)->first();
    }

    public function findById(int $id): ?EloquentSale
    {
        return EloquentSale::find($id);
    }

    public function save(EloquentSale $sale): EloquentSale
    {
        $sale->save();

        return $sale;
    }

    public function delete(EloquentSale $sale): bool
    {
        return $sale->delete();
    }
}
