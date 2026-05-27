<?php

namespace App\User\Infrastructure\Persistence\Repositories;

use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Entity\User;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function __construct(
        private EloquentUser $model,
    ) {}

    public function save(User $user): void
    {
        $eloquentUser = $this->model->newQuery()->withTrashed()->updateOrCreate(
            ['uuid' => $user->id()->value()],
            [
                'restaurant_id' => $user->restaurantId()->value(),
                'name' => $user->name(),
                'email' => $user->email()->value(),
                'password' => $user->passwordHash(),
                'role' => $user->role(),
                'pin' => $user->pin(),
                'created_at' => $user->createdAt()->value(),
                'updated_at' => $user->updatedAt()->value(),
            ]
        );

        if ($eloquentUser->trashed()) {
            $eloquentUser->restore();
        }
    }

    public function findById(Uuid $id): ?User
    {
        $model = $this->model->newQuery()->where('uuid', $id->value())->first();

        if ($model === null) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function findByEmail(Email $email): ?User
    {
        $model = $this->model->newQuery()->where('email', $email->value())->first();

        if ($model === null) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        $paginator->getCollection()->transform(function (EloquentUser $model) {
            return $this->toDomainEntity($model);
        });

        return $paginator;
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentUser $model): User
    {
        return User::fromPersistence(
            $model->uuid,
            $model->name,
            $model->email,
            $model->password,
            $model->restaurant_id,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
            $model->role,
            $model->pin
        );
    }
}
