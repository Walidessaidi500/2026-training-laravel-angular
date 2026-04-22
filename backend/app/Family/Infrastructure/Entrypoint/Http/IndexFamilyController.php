<?php

namespace App\Family\Infrastructure\Entrypoint\Http;

use App\Family\Domain\Interfaces\FamilyRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IndexFamilyController
{
    public function __construct(
        private FamilyRepositoryInterface $familyRepository
        ) {
    }

    public function __invoke(Request $request):JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;
        $active = $request->has('active') ? (bool) $request->query('active') : null;

        $families = $this->familyRepository->list($page, $perPage, $restaurantId, $active);

        return response()->json([
            'data' => $families->items(),
            'meta' => [
                'current_page' => $families->currentPage(),
                'per_page' => $families->perPage(),
                'total' => $families->total(),
                'last_page' => $families->lastPage(),
            ],
        ]);
    }
}