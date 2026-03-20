<?php

use App\User\Infrastructure\Entrypoint\Http\LoginController;
use App\User\Infrastructure\Entrypoint\Http\PostController;
use Illuminate\Support\Facades\Route;

Route::post('/users', PostController::class);
Route::post('/login', LoginController::class);

