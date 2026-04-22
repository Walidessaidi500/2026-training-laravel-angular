<?php

use App\Tax\Infrastructure\Entrypoint\Http\DeleteTaxController;
use App\Tax\Infrastructure\Entrypoint\Http\GetTaxController;
use App\Tax\Infrastructure\Entrypoint\Http\IndexTaxController;
use App\Tax\Infrastructure\Entrypoint\Http\UpdateTaxController;
use App\Tax\Infrastructure\Entrypoint\Http\StoreTaxController;
use Illuminate\Support\Facades\Route;

Route::get('/taxes', IndexTaxController::class);
Route::get('/taxes/{uuid}', GetTaxController::class);
Route::post('/taxes', StoreTaxController::class);
Route::put('/taxes/{uuid}', UpdateTaxController::class);
Route::delete('/taxes/{uuid}', DeleteTaxController::class);
