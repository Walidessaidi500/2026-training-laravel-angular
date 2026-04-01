<?php

namespace App\User\Infrastructure\Persistence\Repositories;

use App\Shared\Domain\ValueObject\Email;
use App\Shared\Domain\ValueObject\Uuid;
use App\User\Domain\Entity\User;
use App\User\Domain\Interfaces\UserRepositoryInterface;
use App\User\Infrastructure\Persistence\Models\EloquentUser;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function __construct(
        private EloquentUser $model,
    ) {}

    public function save(User $user): void
    {
        $this->model->newQuery()->updateOrCreate(
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
