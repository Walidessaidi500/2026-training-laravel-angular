<?php

namespace App\Tax\Infrastructure\Persistence\Repositories;

use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Domain\Entity\Tax;
use App\Tax\Domain\Interfaces\TaxRepositoryInterface;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentTaxRepository implements TaxRepositoryInterface
{
    public function __construct(
        private EloquentTax $model,
    ) {}

    public function save(Tax $tax): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $tax->id()->value()],
            [
                'restaurant_id' => $tax->restaurantId(),
                'name' => $tax->name(),
                'percentage' => $tax->percentage(),
                'created_at' => $tax->createdAt()->value(),
                'updated_at' => $tax->updatedAt()->value(),
            ],
        );
    }

    public function findById(Uuid $id): ?Tax
    {
        $model = $this->model->newQuery()->where('uuid', $id->value())->first();

        if ($model === null) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    /**
     * @return Tax[]
     */
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentTax $model) => $this->toDomainEntity($model))
            ->all();
    }

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->orderBy('name');

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        return $query
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(fn (EloquentTax $model) => $this->toDomainEntity($model));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentTax $model): Tax
    {
        return Tax::fromPersistence(
            $model->uuid,
            (int) $model->restaurant_id,
            $model->name,
            (int) $model->percentage,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }
}
