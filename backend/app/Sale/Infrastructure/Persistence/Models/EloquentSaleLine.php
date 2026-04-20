<?php

namespace App\Sale\Infrastructure\Persistence\Models;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Database\Factories\SaleLineFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentSaleLine extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'sales_lines';

    protected static function newFactory(): Factory
    {
        return SaleLineFactory::new();
    }

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'sale_id',
        'order_line_id',
        'product_id',
        'user_id',
        'quantity',
        'price',
        'tax_percentage',
    ];

    public function orderLine(): BelongsTo
    {
        return $this->belongsTo(\App\Order\Infrastructure\Persistence\Models\EloquentOrderLine::class, 'order_line_id');
    }

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'integer',
            'tax_percentage' => 'integer',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(EloquentSale::class, 'sale_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(EloquentProduct::class, 'product_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(EloquentUser::class, 'user_id');
    }
}
