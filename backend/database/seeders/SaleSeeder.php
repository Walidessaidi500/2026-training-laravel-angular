<?php

namespace Database\Seeders;

use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Sale\Infrastructure\Persistence\Models\EloquentSale;
use App\Sale\Infrastructure\Persistence\Models\EloquentSaleLine;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Zone\Infrastructure\Persistence\Models\EloquentTable;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $users = EloquentUser::all();
        $tables = EloquentTable::all();
        $products = EloquentProduct::where('active', true)->get();

        $ticketNumber = 1;

        // Crear 10 ventas cerradas (historial)
        for ($i = 0; $i < 10; $i++) {
            $opener = $users->random();
            $closer = $users->random();
            $table = $tables->random();
            $openedAt = now()->subDays(rand(1, 15))->subHours(rand(1, 8));
            $closedAt = (clone $openedAt)->addHours(rand(1, 3));

            $sale = EloquentSale::factory()->closed()->create([
                'ticket_number' => $ticketNumber++,
                'table_id' => $table->id,
                'opened_by_user_id' => $opener->id,
                'closed_by_user_id' => $closer->id,
                'diners' => rand(1, 6),
                'opened_at' => $openedAt,
                'closed_at' => $closedAt,
            ]);

            // Añadir entre 2 y 6 líneas por venta
            $lineCount = rand(2, 6);
            $total = 0;

            for ($j = 0; $j < $lineCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 3);
                $linePrice = $product->price;
                $taxPercentage = $product->tax->percentage;

                EloquentSaleLine::factory()->create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id,
                    'quantity' => $quantity,
                    'price' => $linePrice,
                    'tax_percentage' => $taxPercentage,
                ]);

                // línea = price × quantity
                // total línea con impuesto = línea + (línea × tax_percentage / 100)
                $lineSubtotal = $linePrice * $quantity;
                $total += $lineSubtotal + (int) ($lineSubtotal * $taxPercentage / 100);
            }

            $sale->update(['total' => $total]);
        }

        // Crear 3 ventas abiertas (en curso)
        for ($i = 0; $i < 3; $i++) {
            $opener = $users->random();
            $table = $tables[$i]; // Primeras 3 mesas para evitar conflictos

            $sale = EloquentSale::factory()->create([
                'table_id' => $table->id,
                'opened_by_user_id' => $opener->id,
                'diners' => rand(1, 4),
                'opened_at' => now()->subMinutes(rand(10, 90)),
            ]);

            // Añadir entre 1 y 3 líneas
            $lineCount = rand(1, 3);

            for ($j = 0; $j < $lineCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 2);

                EloquentSaleLine::factory()->create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'user_id' => $opener->id,
                    'quantity' => $quantity,
                    'price' => $product->price,
                    'tax_percentage' => $product->tax->percentage,
                ]);
            }
        }
    }
}
