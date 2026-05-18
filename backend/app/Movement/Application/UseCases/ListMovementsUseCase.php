<?php

namespace App\Movement\Application\UseCases;

use App\Movement\Domain\Interfaces\MovementRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ListMovementsUseCase
{
    public function __construct(
        private MovementRepositoryInterface $repository,
    ) {}

    public function execute(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        return $this->repository->list($page, $perPage, $restaurantId);
    }
}
