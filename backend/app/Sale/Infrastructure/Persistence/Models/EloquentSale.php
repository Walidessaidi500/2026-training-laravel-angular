<?php

namespace App\Sale\Infrastructure\Persistence\Models;

use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Zone\Infrastructure\Persistence\Models\EloquentTable;
use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentSale extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'sales';

    protected static function newFactory(): Factory
    {
        return SaleFactory::new();
    }

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'order_id',
        'table_id',
        'user_id',
        'opened_by_user_id',
        'closed_by_user_id',
        'ticket_number',
        'diners',
        'opened_at',
        'closed_at',
        'value_date',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'ticket_number' => 'integer',
            'diners' => 'integer',
            'total' => 'integer',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'value_date' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(\App\Order\Infrastructure\Persistence\Models\EloquentOrder::class, 'order_id');
    }

    public function table(): BelongsTo
    {
        return $this->belongsTo(EloquentTable::class, 'table_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(EloquentUser::class, 'user_id');
    }

    public function openedByUser(): BelongsTo
    {
        return $this->belongsTo(EloquentUser::class, 'opened_by_user_id');
    }

    public function closedByUser(): BelongsTo
    {
        return $this->belongsTo(EloquentUser::class, 'closed_by_user_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(EloquentSaleLine::class, 'sale_id');
    }
}
