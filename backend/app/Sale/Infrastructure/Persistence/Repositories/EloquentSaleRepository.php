<?php

namespace App\Sale\Infrastructure\Persistence\Repositories;

use App\Sale\Domain\Entity\Sale;
use App\Sale\Domain\Entity\SaleLine;
use App\Sale\Domain\Interfaces\SaleRepositoryInterface;
use App\Sale\Infrastructure\Persistence\Models\EloquentSale;
use App\Sale\Infrastructure\Persistence\Models\EloquentSaleLine;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Support\Facades\DB;

class EloquentSaleRepository implements SaleRepositoryInterface
{
    public function save(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            $eloquentSale = EloquentSale::updateOrCreate(
                ['uuid' => $sale->id()->value()],
                [
                    'restaurant_id' => $sale->restaurantId()->value(),
                    'order_id' => DB::table('orders')->where('uuid', $sale->orderId()->value())->value('id'),
                    'table_id' => DB::table('tables')->where('uuid', $sale->tableId()->value())->value('id'),
                    'user_id' => DB::table('users')->where('uuid', $sale->userId()->value())->value('id'),
                    'opened_by_user_id' => DB::table('users')->where('uuid', $sale->openedByUserId()->value())->value('id'),
                    'closed_by_user_id' => $sale->closedByUserId() ? DB::table('users')->where('uuid', $sale->closedByUserId()->value())->value('id') : null,
                    'ticket_number' => $sale->ticketNumber(),
                    'diners' => $sale->diners(),
                    'opened_at' => $sale->openedAt()->value(),
                    'closed_at' => $sale->closedAt()?->value(),
                    'value_date' => $sale->valueDate()->value(),
                    'total' => $sale->total(),
                ]
            );

            // Sync lines
            $existingLineIds = $eloquentSale->lines()->pluck('uuid')->toArray();
            $newLineIds = array_map(fn($line) => $line->id()->value(), $sale->lines());

            // Delete lines not in the new set
            $linesToDelete = array_diff($existingLineIds, $newLineIds);
            EloquentSaleLine::whereIn('uuid', $linesToDelete)->delete();

            foreach ($sale->lines() as $line) {
                EloquentSaleLine::updateOrCreate(
                    ['uuid' => $line->id()->value()],
                    [
                        'restaurant_id' => $line->restaurantId()->value(),
                        'sale_id' => $eloquentSale->id,
                        'order_line_id' => DB::table('order_lines')->where('uuid', $line->orderLineId()->value())->value('id'),
                        'product_id' => DB::table('products')->where('uuid', $line->productId()->value())->value('id'),
                        'user_id' => DB::table('users')->where('uuid', $line->userId()->value())->value('id'),
                        'quantity' => $line->quantity(),
                        'price' => $line->price(),
                        'tax_percentage' => $line->taxPercentage(),
                    ]
                );
            }
        });
    }

    public function find(Uuid $uuid): ?Sale
    {
        $eloquentSale = EloquentSale::with(['lines'])->where('uuid', $uuid->value())->first();

        if (!$eloquentSale) {
            return null;
        }

        return $this->toDomain($eloquentSale);
    }

    public function delete(Uuid $uuid): void
    {
        EloquentSale::where('uuid', $uuid->value())->delete();
    }

    public function list(int $page, int $perPage, ?int $restaurantId): array
    {
        $query = EloquentSale::with(['lines']);

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

    private function toDomain(EloquentSale $eloquentSale): Sale
    {
        $lines = $eloquentSale->lines->map(function ($line) {
            return SaleLine::fromPersistence(
                $line->uuid,
                $line->restaurant_id,
                $line->sale->uuid,
                DB::table('order_lines')->where('id', $line->order_line_id)->value('uuid'),
                DB::table('products')->where('id', $line->product_id)->value('uuid'),
                DB::table('users')->where('id', $line->user_id)->value('uuid'),
                $line->quantity,
                $line->price,
                $line->tax_percentage,
                new \DateTimeImmutable($line->created_at),
                new \DateTimeImmutable($line->updated_at)
            );
        })->toArray();

        return Sale::fromPersistence(
            $eloquentSale->uuid,
            $eloquentSale->restaurant_id,
            DB::table('orders')->where('id', $eloquentSale->order_id)->value('uuid'),
            DB::table('tables')->where('id', $eloquentSale->table_id)->value('uuid'),
            DB::table('users')->where('id', $eloquentSale->user_id)->value('uuid'),
            DB::table('users')->where('id', $eloquentSale->opened_by_user_id)->value('uuid'),
            $eloquentSale->closed_by_user_id ? DB::table('users')->where('id', $eloquentSale->closed_by_user_id)->value('uuid') : null,
            $eloquentSale->ticket_number,
            $eloquentSale->diners,
            new \DateTimeImmutable($eloquentSale->opened_at),
            $eloquentSale->closed_at ? new \DateTimeImmutable($eloquentSale->closed_at) : null,
            new \DateTimeImmutable($eloquentSale->value_date),
            $eloquentSale->total,
            $lines,
            new \DateTimeImmutable($eloquentSale->created_at),
            new \DateTimeImmutable($eloquentSale->updated_at)
        );
    }
}
