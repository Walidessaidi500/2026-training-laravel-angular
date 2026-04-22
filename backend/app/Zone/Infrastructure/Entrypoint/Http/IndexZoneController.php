<?php

namespace App\Zone\Infrastructure\Entrypoint\Http;

use App\Zone\Domain\Interfaces\ZoneRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexZoneController
{
    public function __construct(
        private ZoneRepositoryInterface $zoneRepository,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $zones = $this->zoneRepository->list($page, $perPage, $restaurantId);

        return response()->json([
            'data' => $zones->items(),
            'meta' => [
                'current_page' => $zones->currentPage(),
                'per_page' => $zones->perPage(),
                'total' => $zones->total(),
                'last_page' => $zones->lastPage(),
            ],
        ]);
    }
}