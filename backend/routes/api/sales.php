<?php

use App\Sale\Infrastructure\Entrypoint\Http\DeleteSaleController;
use App\Sale\Infrastructure\Entrypoint\Http\GetSaleController;
use App\Sale\Infrastructure\Entrypoint\Http\IndexSaleController;
use App\Sale\Infrastructure\Entrypoint\Http\ProcessSaleController;
use Illuminate\Support\Facades\Route;

Route::get('/sales', IndexSaleController::class);
Route::get('/sales/{uuid}', GetSaleController::class);
Route::post('/sales/process', ProcessSaleController::class);
Route::delete('/sales/{uuid}', DeleteSaleController::class);




//Acabar de hacer rutas con su middlewar