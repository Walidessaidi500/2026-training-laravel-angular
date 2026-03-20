<?php

use App\Family\Infrastructure\Entrypoint\Http\FamilyController;
use App\Product\Infrastructure\Entrypoint\Http\ProductController;
use App\Tax\Infrastructure\Entrypoint\Http\TaxController;
use App\User\Infrastructure\Entrypoint\Http\LoginController;
use App\User\Infrastructure\Entrypoint\Http\PostController;
use App\Zone\Infrastructure\Entrypoint\Http\TableController;
use App\Zone\Infrastructure\Entrypoint\Http\ZoneController;
use Illuminate\Support\Facades\Route;

// Rutas públicas
Route::post('/users', PostController::class);
Route::post('/login', LoginController::class);

// Rutas protegidas (requieren token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Familias
    Route::get('/families', [FamilyController::class, 'index']);
    Route::get('/families/{uuid}', [FamilyController::class, 'show']);
    Route::post('/families', [FamilyController::class, 'store']);
    Route::put('/families/{uuid}', [FamilyController::class, 'update']);
    Route::delete('/families/{uuid}', [FamilyController::class, 'destroy']);
    Route::patch('/families/{uuid}/toggle-active', [FamilyController::class, 'toggleActive']);

    // Impuestos
    Route::get('/taxes', [TaxController::class, 'index']);
    Route::get('/taxes/{uuid}', [TaxController::class, 'show']);
    Route::post('/taxes', [TaxController::class, 'store']);
    Route::put('/taxes/{uuid}', [TaxController::class, 'update']);
    Route::delete('/taxes/{uuid}', [TaxController::class, 'destroy']);

    // Productos
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{uuid}', [ProductController::class, 'show']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{uuid}', [ProductController::class, 'update']);
    Route::delete('/products/{uuid}', [ProductController::class, 'destroy']);
    Route::patch('/products/{uuid}/toggle-active', [ProductController::class, 'toggleActive']);

    // Zonas
    Route::get('/zones', [ZoneController::class, 'index']);
    Route::get('/zones/{uuid}', [ZoneController::class, 'show']);
    Route::post('/zones', [ZoneController::class, 'store']);
    Route::put('/zones/{uuid}', [ZoneController::class, 'update']);
    Route::delete('/zones/{uuid}', [ZoneController::class, 'destroy']);

    // Mesas
    Route::get('/tables', [TableController::class, 'index']);
    Route::get('/tables/{uuid}', [TableController::class, 'show']);
    Route::post('/tables', [TableController::class, 'store']);
    Route::put('/tables/{uuid}', [TableController::class, 'update']);
    Route::delete('/tables/{uuid}', [TableController::class, 'destroy']);
});
