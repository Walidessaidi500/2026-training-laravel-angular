<?php

use App\User\Infrastructure\Entrypoint\Http\LoginController;
use App\User\Infrastructure\Entrypoint\Http\GetAuthenticatedUserController;
use Illuminate\Support\Facades\Route;

// 1. Rutas Públicas (No requieren token)
Route::post('/login', LoginController::class);

// 2. Rutas Protegidas (Requieren token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // Ruta del usuario autenticado (es lo suficientemente general para dejarla aquí)
    Route::get('/me', GetAuthenticatedUserController::class);

    // 3. Carga de los submódulos por dominio
    // Al incluirlos dentro de este grupo, TODOS heredan automáticamente el middleware 'auth:sanctum'
    require __DIR__ . '/api/families.php';
    require __DIR__ . '/api/orders.php';
    require __DIR__ . '/api/products.php';
    require __DIR__ . '/api/restaurants.php';
    require __DIR__ . '/api/sales.php';
    require __DIR__ . '/api/tables.php';
    require __DIR__ . '/api/taxes.php';
    require __DIR__ . '/api/users.php';
    require __DIR__ . '/api/zones.php';
});