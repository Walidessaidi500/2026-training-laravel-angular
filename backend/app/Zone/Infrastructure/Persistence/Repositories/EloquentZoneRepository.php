<?php

namespace App\Zone\Infrastructure\Persistence\Repositories;

use App\Shared\Domain\ValueObject\Uuid;
use App\Zone\Domain\Entity\Zone;
use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use App\Zone\Infrastructure\Persistence\Models\EloquentZone;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentZoneRepository implements ZoneRepositoryInterface
{
    public function __construct(private EloquentZone $model) {}

    public function save(Zone $zone): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $zone->id()->value()],
            [
                'name' => $zone->name(),
                'created_at' => $zone->createdAt()->value(),
                'updated_at' => $zone->updatedAt()->value(),
            ],
        );
    }

    public function findById(Uuid $id): ?Zone
    {
        $model = $this->model->newQuery()->where('uuid', $id->value())->first();

        return $model ? $this->toDomainEntity($model) : null;
    }

    /** @return Zone[] */
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentZone $m) => $this->toDomainEntity($m))
            ->all();
    }

    public function list(int $page = 1, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(fn (EloquentZone $m) => $this->toDomainEntity($m));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentZone $model): Zone
    {
        return Zone::fromPersistence(
            $model->uuid,
            $model->name,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }
}
