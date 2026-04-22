<?php

use Illuminate\Support\Facades\Route;

use App\Restaurant\Infrastructure\Entrypoint\Http\IndexRestaurantController;
use App\Restaurant\Infrastructure\Entrypoint\Http\StoreRestaurantController;
use App\Restaurant\Infrastructure\Entrypoint\Http\GetRestaurantController;
use App\Restaurant\Infrastructure\Entrypoint\Http\DeleteRestaurantController;
use App\Restaurant\Infrastructure\Entrypoint\Http\UpdateRestaurantController;


    Route::get('/restaurants', IndexRestaurantController::class);
    Route::get('/restaurants/{uuid}', GetRestaurantController::class);
    Route::post('/restaurants', StoreRestaurantController::class);
    Route::put('/restaurants/{uuid}', UpdateRestaurantController::class);
    Route::delete('/restaurants/{uuid}', DeleteRestaurantController::class);