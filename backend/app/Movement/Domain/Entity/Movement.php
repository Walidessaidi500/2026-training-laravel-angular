<?php

namespace App\Movement\Domain\Entity;

use App\Shared\Domain\ValueObject\Uuid;
use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\RestaurantId;

class Movement
{
    private function __construct(
        private Uuid $id,
        private ?int $userId,
        private ?RestaurantId $restaurantId,
        private ?string $userName,
        private ?string $userEmail,
        private string $action,
        private string $description,
        private ?string $resourceType,
        private ?string $resourceId,
        private ?array $changes,
        private ?string $ipAddress,
        private ?string $userAgent,
        private DomainDateTime $createdAt,
    ) {}

    public static function dddCreate(
        ?int $userId,
        ?RestaurantId $restaurantId,
        ?string $userName,
        ?string $userEmail,
        string $action,
        string $description,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $changes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): self {
        return new self(
            Uuid::generate(),
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
            $userAgent,
            DomainDateTime::now()
        );
    }

    public static function fromPersistence(
        string $uuid,
        ?int $userId,
        ?int $restaurantId,
        ?string $userName,
        ?string $userEmail,
        string $action,
        string $description,
        ?string $resourceType,
        ?string $resourceId,
        ?array $changes,
        ?string $ipAddress,
        ?string $userAgent,
        \DateTimeImmutable $createdAt
    ): self {
        return new self(
            Uuid::create($uuid),
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
            $userAgent,
            DomainDateTime::create($createdAt)
        );
    }

    public function id(): Uuid { return $this->id; }
    public function userId(): ?int { return $this->userId; }
    public function restaurantId(): ?RestaurantId { return $this->restaurantId; }
    public function userName(): ?string { return $this->userName; }
    public function userEmail(): ?string { return $this->userEmail; }
    public function action(): string { return $this->action; }
    public function description(): string { return $this->description; }
    public function resourceType(): ?string { return $this->resourceType; }
    public function resourceId(): ?string { return $this->resourceId; }
    public function changes(): ?array { return $this->changes; }
    public function ipAddress(): ?string { return $this->ipAddress; }
    public function userAgent(): ?string { return $this->userAgent; }
    public function createdAt(): DomainDateTime { return $this->createdAt; }
}
