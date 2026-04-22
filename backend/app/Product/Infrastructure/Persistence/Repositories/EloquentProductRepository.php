<?php

namespace App\Product\Infrastructure\Persistence\Repositories;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Product\Domain\Entity\Product;
use App\Product\Domain\Interfaces\ProductRepositoryInterface;
use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Shared\Domain\ValueObject\Uuid;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function __construct(
        private EloquentProduct $model,
    ) {}
// convierte las entidades de dominio en modelo de base de datos
    public function save(Product $product): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $product->id()->value()],
            [
                'family_id' => $product->familyId() ? $this->resolveFamilyId($product->familyId()) : null,
                'tax_id' => $product->taxId() ? $this->resolveTaxId($product->taxId()) : null,
                'name' => $product->name(),
                'price' => $product->price()->value(),
                'stock' => $product->stock(),
                'restaurant_id' => $product->restaurantId()->value(),
                'active' => $product->isActive(),
                'image_src' => $product->imageSrc(),
                'created_at' => $product->createdAt()->value(),
                'updated_at' => $product->updatedAt()->value(),
            ],
        );
    }

    public function findById(Uuid $id): ?Product
    {
        $model = $this->model->newQuery()
            ->with(['family', 'tax'])
            ->where('uuid', $id->value())
            ->first();

        if ($model === null) {
            return null;
        }

        return $this->toDomainEntity($model);
    }

    
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->with(['family', 'tax'])
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentProduct $model) => $this->toDomainEntity($model))
            ->all();
    }

    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null, ?bool $active = null): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['family', 'tax'])
            ->orderBy('name');

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        if ($active !== null) {
            $query->where('active', $active);

            // Si se pide activos (para el TPV), debemos filtrar también por familia activa
            if ($active === true) {
                $query->whereHas('family', function ($q) {
                    $q->where('active', true);
                });
            }
        }

        return $query
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(fn (EloquentProduct $model) => $this->toDomainEntity($model));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    public function getGlobalStats(?int $restaurantId = null): array
    {
        $query = $this->model->newQuery();

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        return [
            'total' => (clone $query)->count(),
            'active' => (clone $query)->where('active', true)->count(),
            'out_of_stock' => (clone $query)->where('stock', '<=', 0)->count(),
        ];
    }

    private function toDomainEntity(EloquentProduct $model): Product
    {
        return Product::fromPersistence(
            $model->uuid,
            $model->family?->uuid,
            $model->tax?->uuid,
            $model->name,
            (int) $model->price,
            (int) $model->stock,
            (int) $model->restaurant_id,
            (bool) $model->active,
            $model->image_src,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }

    private function resolveFamilyId(?Uuid $familyUuid): ?int
    {
        if ($familyUuid === null) {
            return null;
        }

        return EloquentFamily::where('uuid', $familyUuid->value())->firstOrFail()->id;
    }

    private function resolveTaxId(?Uuid $taxUuid): ?int
    {
        if ($taxUuid === null) {
            return null;
        }

        return EloquentTax::where('uuid', $taxUuid->value())->firstOrFail()->id;
    }
}
