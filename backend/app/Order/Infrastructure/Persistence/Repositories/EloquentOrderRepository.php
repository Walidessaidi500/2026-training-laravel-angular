<?php

namespace App\Order\Infrastructure\Persistence\Repositories;

use App\Order\Infrastructure\Persistence\Models\EloquentOrder;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentOrderRepository
{
    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        $query = EloquentOrder::query();

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(string $uuid): ?EloquentOrder
    {
        return EloquentOrder::where('uuid', $uuid)->first();
    }

    public function findById(int $id): ?EloquentOrder
    {
        return EloquentOrder::find($id);
    }

    public function save(EloquentOrder $order): EloquentOrder
    {
        $order->save();

        return $order;
    }

    public function delete(EloquentOrder $order): bool
    {
        return $order->delete();
    }
}
