<?php

namespace App\Tax\Infrastructure\Persistence\Models;

use Database\Factories\TaxFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EloquentTax extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'taxes';

    protected static function newFactory(): Factory
    {
        return TaxFactory::new();
    }

    protected $fillable = [
        'uuid',
        'restaurant_id',
        'name',
        'percentage',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'integer',
        ];
    }
}
