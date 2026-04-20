<?php

namespace App\Order\Domain\Interfaces;

use App\Order\Domain\Entity\Order;
use App\Shared\Domain\ValueObject\Uuid;

interface OrderRepositoryInterface
{
    public function save(Order $order): void;

    public function find(Uuid $uuid): ?Order;
    
    public function findByTable(Uuid $tableUuid, string $status): ?Order;

    public function delete(Uuid $uuid): void;

    public function list(int $page, int $perPage, ?int $restaurantId): array;
}
