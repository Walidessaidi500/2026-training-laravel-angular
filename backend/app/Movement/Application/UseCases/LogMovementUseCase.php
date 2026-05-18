<?php

namespace App\Movement\Application\UseCases;

use App\Movement\Domain\Entity\Movement;
use App\Movement\Domain\Interfaces\MovementRepositoryInterface;

class LogMovementUseCase
{
    public function __construct(
        private MovementRepositoryInterface $repository,
    ) {}

    public function execute(
        ?int $userId,
        ?int $restaurantId,
        ?string $userName,
        ?string $userEmail,
        string $action,
        string $description,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $changes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): void {
        $movement = Movement::create(
            $userId,
            $restaurantId,
            $userName,
            $userEmail,
            $action,
            $description,
            $resourceType,
            $resourceId,
            $changes,
            $ipAddress,
            $userAgent
        );

        $this->repository->save($movement);
    }
}
