<?php

namespace App\Sale\Domain\Entity;

use App\Shared\Domain\ValueObject\DomainDateTime;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\Uuid;

class Sale implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private RestaurantId $restaurantId,
        private Uuid $orderId,
        private Uuid $tableId,
        private Uuid $userId,
        private Uuid $openedByUserId,
        private ?Uuid $closedByUserId,
        private ?int $ticketNumber,
        private int $diners,
        private DomainDateTime $openedAt,
        private ?DomainDateTime $closedAt,
        private DomainDateTime $valueDate,
        private int $total,
        private array $lines,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
        private string $paymentMethod = 'cash',
        private int $amountCash = 0,
        private int $amountCard = 0,
    ) {
    }

    public static function dddCreate(
        RestaurantId $restaurantId,
        Uuid $orderId,
        Uuid $tableId,
        Uuid $userId,
        Uuid $openedByUserId,
        int $diners,
        array $lines,
        string $paymentMethod = 'cash',
        int $amountCash = 0,
        int $amountCard = 0,
    ): self {
        $now = DomainDateTime::now();
        
        $total = array_reduce($lines, function (int $carry, SaleLine $line) {
            return $carry + ($line->price() * $line->quantity());
        }, 0);

        return new self(
            Uuid::generate(),
            $restaurantId,
            $orderId,
            $tableId,
            $userId,
            $openedByUserId,
            null,
            null,
            $diners,
            $now,
            null,
            $now,
            $total,
            $lines,
            $now,
            $now,
            $paymentMethod,
            $amountCash,
            $amountCard
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $orderId,
        string $tableId,
        string $userId,
        string $openedByUserId,
        ?string $closedByUserId,
        ?int $ticketNumber,
        int $diners,
        \DateTimeImmutable $openedAt,
        ?\DateTimeImmutable $closedAt,
        \DateTimeImmutable $valueDate,
        int $total,
        array $lines,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
        string $paymentMethod = 'cash',
        int $amountCash = 0,
        int $amountCard = 0,
    ): self {
        return new self(
            Uuid::create($id),
            RestaurantId::create($restaurantId),
            Uuid::create($orderId),
            Uuid::create($tableId),
            Uuid::create($userId),
            Uuid::create($openedByUserId),
            $closedByUserId ? Uuid::create($closedByUserId) : null,
            $ticketNumber,
            $diners,
            DomainDateTime::create($openedAt),
            $closedAt ? DomainDateTime::create($closedAt) : null,
            DomainDateTime::create($valueDate),
            $total,
            $lines,
            DomainDateTime::create($createdAt),
            DomainDateTime::create($updatedAt),
            $paymentMethod,
            $amountCash,
            $amountCard
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

    public function orderId(): Uuid
    {
        return $this->orderId;
    }

    public function tableId(): Uuid
    {
        return $this->tableId;
    }

    public function userId(): Uuid
    {
        return $this->userId;
    }

    public function openedByUserId(): Uuid
    {
        return $this->openedByUserId;
    }

    public function closedByUserId(): ?Uuid
    {
        return $this->closedByUserId;
    }

    public function ticketNumber(): ?int
    {
        return $this->ticketNumber;
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

    public function valueDate(): DomainDateTime
    {
        return $this->valueDate;
    }

    public function total(): int
    {
        return $this->total;
    }

    public function lines(): array
    {
        return $this->lines;
    }

    public function close(Uuid $closedByUserId, int $ticketNumber): void
    {
        $this->closedByUserId = $closedByUserId;
        $this->ticketNumber = $ticketNumber;
        $this->closedAt = DomainDateTime::now();
        $this->updatedAt = DomainDateTime::now();
    }

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'restaurant_id' => $this->restaurantId->value(),
            'order_uuid' => $this->orderId->value(),
            'table_uuid' => $this->tableId->value(),
            'user_uuid' => $this->userId->value(),
            'opened_by_user_uuid' => $this->openedByUserId->value(),
            'closed_by_user_uuid' => $this->closedByUserId?->value(),
            'ticket_number' => $this->ticketNumber,
            'diners' => $this->diners,
            'opened_at' => $this->openedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'closed_at' => $this->closedAt?->value()->format('Y-m-d\TH:i:s.u\Z'),
            'value_date' => $this->valueDate->value()->format('Y-m-d\TH:i:s.u\Z'),
            'total' => $this->total,
            'lines' => $this->lines,
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
