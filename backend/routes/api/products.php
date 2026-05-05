<?php

use App\Product\Infrastructure\Entrypoint\Http\DeleteProductController;
use App\Product\Infrastructure\Entrypoint\Http\GetProductController;
use App\Product\Infrastructure\Entrypoint\Http\IndexProductController;
use App\Product\Infrastructure\Entrypoint\Http\StoreProductController;
use App\Product\Infrastructure\Entrypoint\Http\ToggleProductController;
use App\Product\Infrastructure\Entrypoint\Http\UpdateProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', IndexProductController::class);
Route::get('/products/{uuid}', GetProductController::class);
Route::post('/products', StoreProductController::class);
Route::put('/products/{uuid}', UpdateProductController::class);
Route::delete('/products/{uuid}', DeleteProductController::class);
Route::patch('/products/{uuid}/toggle-active', ToggleProductController::class);
