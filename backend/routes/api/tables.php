<?php

use App\Table\Infrastructure\Entrypoint\Http\DeleteTableController;
use App\Table\Infrastructure\Entrypoint\Http\GetTableController;
use App\Table\Infrastructure\Entrypoint\Http\IndexTableController;
use App\Table\Infrastructure\Entrypoint\Http\StoreTableController;
use App\Table\Infrastructure\Entrypoint\Http\UpdateTableController;
use Illuminate\Support\Facades\Route;

Route::get('/tables', IndexTableController::class);
Route::get('/tables/{uuid}', GetTableController::class);
Route::post('/tables', StoreTableController::class);
Route::put('/tables/{uuid}', UpdateTableController::class);
Route::delete('/tables/{uuid}', DeleteTableController::class);