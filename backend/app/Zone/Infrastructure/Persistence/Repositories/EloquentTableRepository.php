<?php

namespace App\Zone\Infrastructure\Persistence\Repositories;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Table;
use App\Zone\Domain\Interfaces\TableRepositoryInterface;
use App\Zone\Infrastructure\Persistence\Models\EloquentTable;
use App\Zone\Infrastructure\Persistence\Models\EloquentZone;
use Illuminate\Pagination\Paginator;

class EloquentTableRepository implements TableRepositoryInterface
{
    public function __construct(private EloquentTable $model) {}

    public function save(Table $table): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $table->id()->value()],
            [
                'zone_id' => $this->resolveZoneId($table->zoneId()),
                'name' => $table->name(),
                'created_at' => $table->createdAt()->value(),
                'updated_at' => $table->updatedAt()->value(),
            ],
        );
    }

    public function findById(Uuid $id): ?Table
    {
        $model = $this->model->newQuery()
            ->with('zone')
            ->where('uuid', $id->value())
            ->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    /** @return Table[] */
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->with('zone')
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentTable $m) => $this->toDomainEntity($m))
            ->all();
    }

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): Paginator
    {
        $query = $this->model->newQuery()
            ->with('zone')
            ->orderBy('name');

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        $items = $query->paginate($perPage, ['*'], 'page', $page);

        return $items->map(fn (EloquentTable $m) => $this->toDomainEntity($m));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentTable $model): Table
    {
        return Table::fromPersistence(
            $model->uuid,
            $model->zone->uuid,
            $model->name,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }

    private function resolveZoneId(Uuid $zoneUuid): int
    {
        return EloquentZone::where('uuid', $zoneUuid->value())->firstOrFail()->id;
    }
}
