<?php

use App\Movement\Infrastructure\Entrypoint\Http\ListMovementsController;
use Illuminate\Support\Facades\Route;

Route::get('/movements', ListMovementsController::class);
