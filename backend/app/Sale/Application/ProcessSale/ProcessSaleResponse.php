<?php

namespace App\Sale\Application\ProcessSale;

use App\Sale\Domain\Entity\Sale;

class ProcessSaleResponse
{
    private function __construct(
        private array $data
    ) {}

    public static function create(Sale $sale): self
    {
        return new self([
            'uuid' => $sale->id()->value(),
            'ticket_number' => $sale->ticketNumber(),
            'total' => $sale->total(),
            'payment_method' => $sale->paymentMethod(),
            'amount_cash' => $sale->amountCash(),
            'amount_card' => $sale->amountCard(),
            'closed_at' => $sale->closedAt()?->format('Y-m-d H:i:s'),
            'lines' => array_map(function ($line) {
                return [
                    'uuid' => $line->id()->value(),
                    'product_uuid' => $line->productId()->value(),
                    'quantity' => $line->quantity(),
                    'price' => $line->price(),
                    'tax_percentage' => $line->taxPercentage(),
                ];
            }, $sale->lines())
        ]);
    }

    public function toArray(): array
    {
        return $this->data;
    }
}
