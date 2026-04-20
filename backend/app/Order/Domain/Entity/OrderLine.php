<?php

namespace App\Order\Domain\Entity;

use App\Shared\Domain\ValueObject\Uuid;
use App\Shared\Domain\ValueObject\RestaurantId;
use App\Shared\Domain\ValueObject\DomainDateTime;

class OrderLine implements \JsonSerializable
{
    private function __construct(
        private Uuid $id,
        private RestaurantId $restaurantId,
        private Uuid $orderId,
        private Uuid $productId,
        private Uuid $userId,
        private int $quantity,
        private int $price,
        private int $taxPercentage,
        private DomainDateTime $createdAt,
        private DomainDateTime $updatedAt,
    ) {
    }

    public static function dddCreate(
        RestaurantId $restaurantId,
        Uuid $orderId,
        Uuid $productId,
        Uuid $userId,
        int $quantity,
        int $price,
        int $taxPercentage,
    ): self {
        $now = DomainDateTime::now();

        return new self(
            Uuid::generate(),
            $restaurantId,
            $orderId,
            $productId,
            $userId,
            $quantity,
            $price,
            $taxPercentage,
            $now,
            $now
        );
    }

    public static function fromPersistence(
        string $id,
        int $restaurantId,
        string $orderId,
        string $productId,
        string $userId,
        int $quantity,
        int $price,
        int $taxPercentage,
        \DateTimeImmutable $createdAt,
        \DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            Uuid::create($id),
            RestaurantId::create($restaurantId),
            Uuid::create($orderId),
            Uuid::create($productId),
            Uuid::create($userId),
            $quantity,
            $price,
            $taxPercentage,
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

    public function orderId(): Uuid
    {
        return $this->orderId;
    }

    public function productId(): Uuid
    {
        return $this->productId;
    }

    public function userId(): Uuid
    {
        return $this->userId;
    }

    public function quantity(): int
    {
        return $this->quantity;
    }

    public function price(): int
    {
        return $this->price;
    }

    public function taxPercentage(): int
    {
        return $this->taxPercentage;
    }

    public function jsonSerialize(): array
    {
        return [
            'uuid' => $this->id->value(),
            'restaurant_id' => $this->restaurantId->value(),
            'order_uuid' => $this->orderId->value(),
            'product_uuid' => $this->productId->value(),
            'user_uuid' => $this->userId->value(),
            'quantity' => $this->quantity,
            'price' => $this->price,
            'tax_percentage' => $this->taxPercentage,
            'created_at' => $this->createdAt->value()->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updatedAt->value()->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
