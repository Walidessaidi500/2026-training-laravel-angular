<?php

namespace App\Movement\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class EloquentMovement extends Model
{
    protected $table = 'movements';

    protected $fillable = [
        'uuid',
        'user_id',
        'restaurant_id',
        'user_name',
        'user_email',
        'action',
        'description',
        'resource_type',
        'resource_id',
        'changes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
    ];
}
