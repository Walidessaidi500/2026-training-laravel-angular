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

    public function save(Product $product): void
    {
        $this->model->newQuery()->updateOrCreate(
            ['uuid' => $product->id()->value()],
            [
                'family_id' => $this->resolveFamilyId($product->familyId()),
                'tax_id' => $this->resolveTaxId($product->taxId()),
                'name' => $product->name(),
                'price' => $product->price(),
                'stock' => $product->stock(),
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

    /**
     * @return Product[]
     */
    public function findAll(): array
    {
        return $this->model->newQuery()
            ->with(['family', 'tax'])
            ->orderBy('name')
            ->get()
            ->map(fn (EloquentProduct $model) => $this->toDomainEntity($model))
            ->all();
    }

    public function list(int $page = 1, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['family', 'tax'])
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(fn (EloquentProduct $model) => $this->toDomainEntity($model));
    }

    public function delete(Uuid $id): void
    {
        $this->model->newQuery()->where('uuid', $id->value())->delete();
    }

    private function toDomainEntity(EloquentProduct $model): Product
    {
        return Product::fromPersistence(
            $model->uuid,
            $model->family->uuid,
            $model->tax->uuid,
            $model->name,
            (int) $model->price,
            (int) $model->stock,
            (bool) $model->active,
            $model->image_src,
            $model->created_at->toDateTimeImmutable(),
            $model->updated_at->toDateTimeImmutable(),
        );
    }

    private function resolveFamilyId(Uuid $familyUuid): int
    {
        return EloquentFamily::where('uuid', $familyUuid->value())->firstOrFail()->id;
    }

    private function resolveTaxId(Uuid $taxUuid): int
    {
        return EloquentTax::where('uuid', $taxUuid->value())->firstOrFail()->id;
    }
}
