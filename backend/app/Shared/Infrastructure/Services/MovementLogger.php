<?php

namespace App\Shared\Infrastructure\Services;

use App\Movement\Application\UseCases\LogMovementUseCase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class MovementLogger
{
    public function __construct(
        private LogMovementUseCase $logMovementUseCase
    ) {}

    public function log(
        string $action,
        string $description,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $changes = null,
        ?array $customUser = null
    ): void {
        $user = Auth::user();
        
        $userId = $customUser['id'] ?? $user?->id;
        $restaurantId = $customUser['restaurant_id'] ?? $user?->restaurant_id;
        $userName = $customUser['name'] ?? $user?->name;
        $userEmail = $customUser['email'] ?? $user?->email;

        $this->logMovementUseCase->execute(
            $userId,
            $restaurantId,
            $userName,
            $userEmail,
            $action,
            $description,
            $resourceType,
            $resourceId,
            $changes,
            Request::ip(),
            Request::userAgent()
        );
    }
}
