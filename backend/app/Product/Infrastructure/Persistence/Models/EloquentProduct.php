<?php

namespace App\Product\Infrastructure\Persistence\Models;

use App\Family\Infrastructure\Persistence\Models\EloquentFamily;
use App\Tax\Infrastructure\Persistence\Models\EloquentTax;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentProduct extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'products';

    protected static function newFactory(): Factory
    {
        return ProductFactory::new();
    }

    protected $fillable = [
        'uuid',
        'family_id',
        'tax_id',
        'image_src',
        'name',
        'price',
        'stock',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'stock' => 'integer',
            'active' => 'boolean',
        ];
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(EloquentFamily::class, 'family_id');
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(EloquentTax::class, 'tax_id');
    }
}
