<?php

namespace App\Movement\Application\ListMovements;

use App\Movement\Domain\Interfaces\MovementRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ListMovements
{
    public function __construct(
        private MovementRepositoryInterface $repository,
    ) {}

    public function __invoke(int $page = 1, int $perPage = 15, ?int $restaurantId = null): LengthAwarePaginator
    {
        return $this->repository->list($page, $perPage, $restaurantId);
    }
}
