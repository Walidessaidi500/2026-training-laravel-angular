<?php

namespace App\Order\Domain\Entity;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class Order implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private RestaurantId $restaurantId,
        private string $status,
        private Uuid $tableId,
        private Uuid $openedByUserId,
        private ?Uuid $closedByUserId,
        private int $diners,
        private DomainDateTime $openedAt,
        private ?DomainDateTime $closedAt,
        private array $lines,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {
    }

    public static function dddCreate(
        RestaurantId $restaurantId,
        Uuid $tableId,
        Uuid $openedByUserId,
        int $diners,
        array $lines = []
    ): self {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $restaurantId,
            'open',
            $tableId,
            $openedByUserId,
            null,
            $diners,
            $now,
            null,
            $lines,
            $now,
            $now
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $status,
        string $tableId,
        string $openedByUserId,
        ?string $closedByUserId,
        int $diners,
        \DateTimeImmutable $openedAt,
        ?\DateTimeImmutable $closedAt,
        array $lines,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            RestaurantId::create($restaurantId),
            $status,
            Uuid::create($tableId),
            Uuid::create($openedByUserId),
            $closedByUserId ? Uuid::create($closedByUserId) : null,
            $diners,
            DomainDateTime::create($openedAt),
            $closedAt ? DomainDateTime::create($closedAt) : null,
            $lines,
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt)
        );
    }

    public function id(): Uuid
    {
        return $this->id;
    }

    public function restaurantId(): RestaurantId
    {
        return $this->restaurantId;
    }

    public function status(): string
    {
        return $this->status;
    }

    public function tableId(): Uuid
    {
        return $this->tableId;
    }

    public function openedByUserId(): Uuid
    {
        return $this->openedByUserId;
    }

    public function closedByUserId(): ?Uuid
    {
        return $this->closedByUserId;
    }

    public function diners(): int
    {
        return $this->diners;
    }

    public function openedAt(): DomainDateTime
    {
        return $this->openedAt;
    }

    public function closedAt(): ?DomainDateTime
    {
        return $this->closedAt;
    }

    public function lines(): array
    {
        return $this->lines;
    }

    public function invoice(Uuid $closedByUserId): void
    {
        $this->status = 'invoiced';
        $this->closedByUserId = $closedByUserId;
        $this->closedAt = DomainDateTime::now();
        $this->updatedAt = DomainDateTime::now();
    }

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'restaurant_id' => $this->restaurantId->value(),
            'status' => $this->status,
            'table_uuid' => $this->tableId->value(),
            'opened_by_user_uuid' => $this->openedByUserId->value(),
            'closed_by_user_uuid' => $this->closedByUserId?->value(),
            'diners' => $this->diners,
            'opened_at' => $this->openedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'closed_at' => $this->closedAt?->value()->format('Y-m-d\TH:i:s.u\Z'),
            'lines' => $this->lines,
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
