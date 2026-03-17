<?php

namespace App\Zone\Infrastructure\Persistence\Models;

use Database\Factories\ZoneFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentZone extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'zones';

    protected static function newFactory(): Factory
    {
        return ZoneFactory::new();
    }

    protected $fillable = [
        'uuid',
        'name',
    ];

    public function tables(): HasMany
    {
        return $this->hasMany(EloquentTable::class, 'zone_id');
    }
}
