<?php

use App\User\Infrastructure\Entrypoint\Http\GetAuthenticatedUserController;
use App\User\Infrastructure\Entrypoint\Http\LoginController;
use Illuminate\Support\Facades\Route;

Route::post('/login', LoginController::class);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', GetAuthenticatedUserController::class);

    
    require __DIR__.'/api/families.php';
    require __DIR__.'/api/orders.php';
    require __DIR__.'/api/products.php';
    require __DIR__.'/api/restaurants.php';
    require __DIR__.'/api/sales.php';
    require __DIR__.'/api/tables.php';
    require __DIR__.'/api/taxes.php';
    require __DIR__.'/api/users.php';
    require __DIR__.'/api/zones.php';
    require __DIR__.'/api/movements.php';
});
