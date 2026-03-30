<?php

namespace App\Family\Infrastructure\Persistence\Models;

use Database\Factories\FamilyFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentFamily extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'families';

    protected static function newFactory(): Factory
    {
        return FamilyFactory::new();
    }

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'name',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }
}
