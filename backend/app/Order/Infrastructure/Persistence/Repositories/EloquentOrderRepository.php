<?php

namespace App\Order\Infrastructure\Persistence\Repositories;

use App\Order\Domain\Entity\Order;
use App\Order\Domain\Entity\OrderLine;
use App\Order\Domain\Interfaces\OrderRepositoryInterface;
use App\Order\Infrastructure\Persistence\Models\EloquentOrder;
use App\Order\Infrastructure\Persistence\Models\EloquentOrderLine;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Support\Facades\DB;

class EloquentOrderRepository implements OrderRepositoryInterface
{
    private function getInternalUserId(string $uuid): ?int
    {
        return DB::table('users')->where('uuid', $uuid)->value('id') 
            ?? DB::table('restaurants')->where('uuid', $uuid)->value('id');
    }

    private function getUuidFromInternalId(int $id): ?string
    {
        // Nota: Esto es un poco ambiguo si hay IDs duplicados en ambas tablas, 
        // pero en este sistema restaurant_id y user_id suelen estar claros por contexto.
        // Como la FK apunta a 'users', primero buscamos en users.
        return DB::table('users')->where('id', $id)->value('uuid')
            ?? DB::table('restaurants')->where('id', $id)->value('uuid');
    }

    public function save(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $eloquentOrder = EloquentOrder::updateOrCreate(
                ['uuid' => $order->id()->value()],
                [
                    'restaurant_id' => $order->restaurantId()->value(),
                    'status' => $order->status(),
                    'table_id' => DB::table('tables')->where('uuid', $order->tableId()->value())->value('id'),
                    'opened_by_user_id' => $this->getInternalUserId($order->openedByUserId()->value()),
                    'closed_by_user_id' => $order->closedByUserId() ? $this->getInternalUserId($order->closedByUserId()->value()) : null,
                    'diners' => $order->diners(),
                    'opened_at' => $order->openedAt()->value(),
                    'closed_at' => $order->closedAt()?->value(),
                ]
            );

            // Sync lines
            $existingLineIds = $eloquentOrder->orderLines()->pluck('uuid')->toArray();
            $newLineIds = array_map(fn($line) => $line->id()->value(), $order->lines());

            $linesToDelete = array_diff($existingLineIds, $newLineIds);
            EloquentOrderLine::whereIn('uuid', $linesToDelete)->delete();

            foreach ($order->lines() as $line) {
                EloquentOrderLine::updateOrCreate(
                    ['uuid' => $line->id()->value()],
                    [
                        'restaurant_id' => $line->restaurantId()->value(),
                        'order_id' => $eloquentOrder->id,
                        'product_id' => DB::table('products')->where('uuid', $line->productId()->value())->value('id'),
                        'user_id' => $this->getInternalUserId($line->userId()->value()),
                        'quantity' => $line->quantity(),
                        'price' => $line->price(),
                        'tax_percentage' => $line->taxPercentage(),
                    ]
                );
            }
        });
    }

    public function find(Uuid $uuid): ?Order
    {
        $eloquentOrder = EloquentOrder::with(['orderLines'])->where('uuid', $uuid->value())->first();

        if (!$eloquentOrder) {
            return null;
        }

        return $this->toDomain($eloquentOrder);
    }

    public function findByTable(Uuid $tableUuid, string $status): ?Order
    {
        $tableId = DB::table('tables')->where('uuid', $tableUuid->value())->value('id');
        
        $eloquentOrder = EloquentOrder::with(['orderLines'])
            ->where('table_id', $tableId)
            ->where('status', $status)
            ->first();

        if (!$eloquentOrder) {
            return null;
        }

        return $this->toDomain($eloquentOrder);
    }

    public function delete(Uuid $uuid): void
    {
        EloquentOrder::where('uuid', $uuid->value())->delete();
    }

    public function list(int $page, int $perPage, ?int $restaurantId): array
    {
        $query = EloquentOrder::with(['orderLines']);

        if ($restaurantId) {
            $query->where('restaurant_id', $restaurantId);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => array_map(fn($item) => $this->toDomain($item), $paginator->items()),
            'meta' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ]
        ];
    }

    private function toDomain(EloquentOrder $eloquentOrder): Order
    {
        $lines = $eloquentOrder->orderLines->map(function ($line) {
            return OrderLine::fromPersistence(
                $line->uuid,
                $line->restaurant_id,
                $line->order->uuid,
                DB::table('products')->where('id', $line->product_id)->value('uuid'),
                $this->getUuidFromInternalId($line->user_id),
                $line->quantity,
                $line->price,
                $line->tax_percentage,
                new \DateTimeImmutable($line->created_at),
                new \DateTimeImmutable($line->updated_at)
            );
        })->toArray();

        return Order::fromPersistence(
            $eloquentOrder->uuid,
            $eloquentOrder->restaurant_id,
            $eloquentOrder->status,
            DB::table('tables')->where('id', $eloquentOrder->table_id)->value('uuid'),
            $this->getUuidFromInternalId($eloquentOrder->opened_by_user_id),
            $eloquentOrder->closed_by_user_id ? $this->getUuidFromInternalId($eloquentOrder->closed_by_user_id) : null,
            $eloquentOrder->diners,
            new \DateTimeImmutable($eloquentOrder->opened_at),
            $eloquentOrder->closed_at ? new \DateTimeImmutable($eloquentOrder->closed_at) : null,
            $lines,
            new \DateTimeImmutable($eloquentOrder->created_at),
            new \DateTimeImmutable($eloquentOrder->updated_at)
        );
    }
}
