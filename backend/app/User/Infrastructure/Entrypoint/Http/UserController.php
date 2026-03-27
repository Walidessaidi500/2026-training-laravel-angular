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

        $users = EloquentUser::paginate($perPage, ['*'], 'page', $page);

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
        $user = $this->userRepository->find($uuid);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'restaurant_id' => 'required|integer|exists:restaurants,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'string|in:admin,supervisor,operator',
            'pin' => 'nullable|string|max:10',
        ]);

        $user = EloquentUser::create([
            'uuid' => Str::uuid()->toString(),
            'restaurant_id' => $validated['restaurant_id'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'role' => $validated['role'] ?? 'operator',
            'pin' => $validated['pin'] ?? null,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        $user = $this->userRepository->find($uuid);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'string|in:admin,supervisor,operator',
            'pin' => 'nullable|string|max:10',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        if (isset($validated['pin'])) {
            $user->pin = $validated['pin'];
        }

        $this->userRepository->save($user);

        return response()->json($user);
    }

    public function destroy(string $uuid): JsonResponse
    {
        $user = $this->userRepository->find($uuid);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $this->userRepository->delete($user);

        return response()->json(['message' => 'User deleted']);
    }

    public function toggleActive(string $uuid): JsonResponse
    {
        $user = $this->userRepository->find($uuid);

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Toggle active status logic if implemented
        // For now, just return the user
        return response()->json($user);
    }
}
