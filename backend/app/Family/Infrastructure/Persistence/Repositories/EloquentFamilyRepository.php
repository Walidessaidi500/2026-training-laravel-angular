<?php

namespace App\Family\Infrastructure\Persistence\Repositories;

use App\Family\Domain\Entity\Family;
use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Shared\Domain\ValueObject\Uuid;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentFamilyRepository implements FamilyRepositoryInterface
{
    public function __construct(
        private EloquentFamily $model,
    ) {}

    public function save(Family $family): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $family->id()->value()],
            [
                'restaurant_id' => $family->restaurantId(),
                'name' => $family->name(),
                'active' => $family->isActive(),
                'created_at' => $family->createdAt()->value(),
                'updated_at' => $family->updatedAt()->value(),
            ],
        );
    }

    public function findById(Uuid $id): ?Family
    {
        $model = $this->model->newQuery()->where('uuid', $id->value())->first();

        if ($model === null) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    /**
     * @return Family[]
     */
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentFamily $model) => $this->toDomainEntity($model))
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
            ->through(fn (EloquentFamily $model) => $this->toDomainEntity($model));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentFamily $model): Family
    {
        return Family::fromPersistence(
            $model->uuid,
            (int) $model->restaurant_id,
            $model->name,
            (bool) $model->active,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }
}
