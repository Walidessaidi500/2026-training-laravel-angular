<?php

namespace App\Order\Infrastructure\Persistence\Models;

use App\Restaurant\Infrastructure\Persistence\Models\EloquentRestaurant;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Zone\Infrastructure\Persistence\Models\EloquentTable;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'status',
        'table_id',
        'opened_by_user_id',
        'closed_by_user_id',
        'diners',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected static function newFactory()
    {
        return OrderFactory::new();
    }

    public function restaurant()
    {
        return $this->belongsTo(EloquentRestaurant::class, 'restaurant_id');
    }

    public function table()
    {
        return $this->belongsTo(EloquentTable::class, 'table_id');
    }

    public function openedByUser()
    {
        return $this->belongsTo(EloquentUser::class, 'opened_by_user_id');
    }

    public function closedByUser()
    {
        return $this->belongsTo(EloquentUser::class, 'closed_by_user_id');
    }

    public function orderLines()
    {
        return $this->hasMany(EloquentOrderLine::class, 'order_id');
    }
}
