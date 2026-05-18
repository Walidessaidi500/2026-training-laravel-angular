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
        ?array $changes = null
    ): void {
        $user = Auth::user();
        
        $this->logMovementUseCase->execute(
            $user?->id,
            $user?->restaurant_id,
            $user?->name,
            $user?->email,
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
