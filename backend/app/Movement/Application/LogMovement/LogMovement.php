<?php

namespace App\Movement\Application\LogMovement;

use App\Movement\Domain\Entity\Movement;
use App\Movement\Domain\Interfaces\MovementRepositoryInterface;
use App\Shared\Domain\ValueObject\RestaurantId;

class LogMovement
{
    public function __construct(
        private MovementRepositoryInterface $repository,
    ) {}

    public function __invoke(
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
        $movement = Movement::dddCreate(
            $userId,
            $restaurantId ? RestaurantId::create($restaurantId) : null,
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
