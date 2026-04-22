<?php

namespace App\Table\Infrastructure\Entrypoint\Http;

use App\Table\Domain\Interfaces\TableRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexTableController
{
    public function __construct(
        private TableRepositoryInterface $tableRepository,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 1000);
        $page = (int) $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $tables = $this->tableRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $tables->items(),
            'meta' => [
                'current_page' => $tables->currentPage(),
                'per_page' => $tables->perPage(),
                'total' => $tables->total(),
                'last_page' => $tables->lastPage(),
            ],
        ]);
    }
}