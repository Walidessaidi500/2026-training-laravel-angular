<?php

use Illuminate\Support\Facades\Route;
use App\User\Infrastructure\Entrypoint\Http\UserController;
use App\User\Infrastructure\Entrypoint\Http\PostController;
use App\User\Infrastructure\Entrypoint\Http\PutController;
use App\User\Infrastructure\Entrypoint\Http\DeleteController;

Route::middleware('role:admin,supervisor')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{uuid}', [UserController::class, 'show']);
});

Route::middleware('role:admin')->group(function () {
    Route::post('/users', PostController::class);
    Route::put('/users/{uuid}', PutController::class);
    Route::delete('/users/{uuid}', DeleteController::class);
    Route::patch('/users/{uuid}/toggle-active', [UserController::class, 'toggleActive']);
});