<?php

namespace App\User\Infrastructure\Entrypoint\Http;

use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\User\Infrastructure\Persistence\Repositories\EloquentUserRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController
{
    public function __construct(private EloquentUserRepository $userRepository) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $page = $request->query('page', 1);
        $restaurantId = $request->user()?->restaurant_id;

        $query = EloquentUser::query();

        if ($restaurantId !== null) {
            $query->where('restaurant_id', $restaurantId);
        }

        $users = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function show(string $uuid): JsonResponse
    {
        $user = EloquentUser::where('uuid', $uuid)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function toggleActive(string $uuid): JsonResponse
    {
        $user = EloquentUser::where('uuid', $uuid)->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        
        
        return response()->json($user);
    }
}
