<?php

namespace App\Zone\Infrastructure\Persistence\Models;

use Database\Factories\TableFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentTable extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'tables';

    protected static function newFactory(): Factory
    {
        return TableFactory::new();
    }

    protected $fillable = [
        'uuid',
        'zone_id',
        'name',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(EloquentZone::class, 'zone_id');
    }
}
