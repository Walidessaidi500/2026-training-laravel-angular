<?php

use App\Family\Infrastructure\Entrypoint\Http\DeleteFamilyController;
use App\Family\Infrastructure\Entrypoint\Http\GetFamilyController;
use App\Family\Infrastructure\Entrypoint\Http\IndexFamilyController;
use App\Family\Infrastructure\Entrypoint\Http\StoreFamilyController;
use App\Family\Infrastructure\Entrypoint\Http\ToggleFamilyController;
use App\Family\Infrastructure\Entrypoint\Http\UpdateFamilyController;


Route::get('/families', IndexFamilyController::class);
Route::get('/families/{uuid}', GetFamilyController::class);
Route::post('/families', StoreFamilyController::class);
Route::put('/families/{uuid}', UpdateFamilyController::class);
Route::delete('/families/{uuid}', DeleteFamilyController::class);
Route::patch('/families/{uuid}/toggle-active', ToggleFamilyController::class);


