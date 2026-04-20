<?php

namespace App\Order\Infrastructure\Persistence\Models;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use Database\Factories\OrderLineFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentOrderLine extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'order_lines';

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'order_id',
        'product_id',
        'user_id',
        'quantity',
        'price',
        'tax_percentage',
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    protected static function newFactory()
    {
        return OrderLineFactory::new();
    }

    public function restaurant()
    {
        return $this->belongsTo(EloquentRestaurant::class, 'restaurant_id');
    }

    public function order()
    {
        return $this->belongsTo(EloquentOrder::class, 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(EloquentProduct::class, 'product_id');
    }

    public function user()
    {
        return $this->belongsTo(EloquentUser::class, 'user_id');
    }
}
