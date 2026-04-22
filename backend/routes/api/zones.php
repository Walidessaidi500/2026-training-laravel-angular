<?php

use App\Zone\Infrastructure\Entrypoint\Http\IndexZoneController;
use App\Zone\Infrastructure\Entrypoint\Http\DeleteZoneController;
use App\Zone\Infrastructure\Entrypoint\Http\GetZoneController;
use App\Zone\Infrastructure\Entrypoint\Http\StoreZoneController;
use App\Zone\Infrastructure\Entrypoint\Http\UpdateZoneController;
use Illuminate\Support\Facades\Route;

Route::get('/zones', IndexZoneController::class);
Route::get('/zones/{uuid}', GetZoneController::class);
Route::post('/zones', StoreZoneController::class);
Route::put('/zones/{uuid}', UpdateZoneController::class);
Route::delete('/zones/{uuid}', DeleteZoneController::class);