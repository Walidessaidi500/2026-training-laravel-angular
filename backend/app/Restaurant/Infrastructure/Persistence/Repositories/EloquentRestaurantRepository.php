<?php

namespace App\Restaurant\Infrastructure\Persistence\Repositories;

use App\Restaurant\Domain\Entity\Restaurant;
use App\Restaurant\Domain\Interfaces\RestaurantRepositoryInterface;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\Shared\Domain\ValueObject\Uuid;

class EloquentRestaurantRepository implements RestaurantRepositoryInterface
{
    public function save(Restaurant $restaurant): void
    {
        EloquentRestaurant::updateOrCreate(
            ['uuid' => $restaurant->id()->value()],
            [
                'name' => $restaurant->name(),
                'legal_name' => $restaurant->legalName(),
                'tax_id' => $restaurant->taxId(),
                'email' => $restaurant->email()->value(),
                'password' => $restaurant->passwordHash(),
            ]
        );
    }

    public function search(Uuid $id): ?Restaurant
    {
        $eloquent = EloquentRestaurant::where('uuid', $id->value())->first();

        if ($eloquent === null) {
            return null;
        }

        return Restaurant::fromPersistence(
            $eloquent->uuid,
            $eloquent->name,
            $eloquent->legal_name,
            $eloquent->tax_id,
            $eloquent->email,
            $eloquent->password,
            new \DateTimeImmutable($eloquent->created_at),
            new \DateTimeImmutable($eloquent->updated_at),
        );
    }

    public function delete(Uuid $id): void
    {
        EloquentRestaurant::where('uuid', $id->value())->delete();
    }

    public function all(): array
    {
        return EloquentRestaurant::all()
            ->map(fn (EloquentRestaurant $eloquent) => Restaurant::fromPersistence(
                $eloquent->uuid,
                $eloquent->name,
                $eloquent->legal_name,
                $eloquent->tax_id,
                $eloquent->email,
                $eloquent->password,
                new \DateTimeImmutable($eloquent->created_at),
                new \DateTimeImmutable($eloquent->updated_at),
            ))
            ->toArray();
    }
}
