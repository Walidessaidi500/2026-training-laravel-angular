<?php

namespace App\Movement\Infrastructure\Persistence\Repositories;

use App\Movement\Domain\Entity\Movement;
use App\Movement\Domain\Interfaces\MovementRepositoryInterface;
use App\Movement\Infrastructure\Persistence\Models\EloquentMovement;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentMovementRepository implements MovementRepositoryInterface
{
    public function __construct(
        private EloquentMovement $model,
    ) {}

    public function save(Movement $movement): void
    {
        $this->model->newQuery()->create([
            'uuid' => $movement->id()->value(),
            'user_id' => $movement->userId(),
            'restaurant_id' => $movement->restaurantId(),
            'user_name' => $movement->userName(),
            'user_email' => $movement->userEmail(),
            'action' => $movement->action(),
            'description' => $movement->description(),
            'resource_type' => $movement->resourceType(),
            'resource_id' => $movement->resourceId(),
            'changes' => $movement->changes(),
            'ip_address' => $movement->ipAddress(),
            'user_agent' => $movement->userAgent(),
            'created_at' => $movement->createdAt()->value(),
            'updated_at' => $movement->createdAt()->value(),
        ]);
    }

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->orderBy('created_at', 'desc');

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $paginator->getCollection()->transform(function (EloquentMovement $model) {
            return $this->toDomainEntity($model);
        });

        return $paginator;
    }

    private function toDomainEntity(EloquentMovement $model): Movement
    {
        return Movement::fromPersistence(
            $model->uuid,
            $model->user_id,
            $model->restaurant_id,
            $model->user_name,
            $model->user_email,
            $model->action,
            $model->description,
            $model->resource_type,
            $model->resource_id,
            $model->changes,
            $model->ip_address,
            $model->user_agent,
            $model->created_at->toDateTimeImmutable()
        );
    }
}
