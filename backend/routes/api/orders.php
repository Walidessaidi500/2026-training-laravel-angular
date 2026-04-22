<?php

use App\Order\Infrastructure\Entrypoint\Http\ActiveOrderController;
use App\Order\Infrastructure\Entrypoint\Http\DeleteOrderController;
use App\Order\Infrastructure\Entrypoint\Http\GetOrderController;
use App\Order\Infrastructure\Entrypoint\Http\IndexOrderController;
use App\Order\Infrastructure\Entrypoint\Http\SyncOrderController;



Route::get('/orders', IndexOrderController::class);
    Route::get('/orders/table/{tableUuid}', ActiveOrderController::class);
    Route::get('/orders/{uuid}', GetOrderController::class);
    Route::post('/orders/sync', SyncOrderController::class);
    Route::delete('/orders/{uuid}', DeleteOrderController::class);