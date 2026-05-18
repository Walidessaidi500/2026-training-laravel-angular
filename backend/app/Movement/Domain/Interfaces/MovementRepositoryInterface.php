<?php

namespace App\Movement\Domain\Interfaces;

use App\Movement\Domain\Entity\Movement;
use Illuminate\Pagination\LengthAwarePaginator;

interface MovementRepositoryInterface
{
    public function save(Movement $movement): void;
    public function list(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator;
}
