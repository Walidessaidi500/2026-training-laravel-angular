<?php

namespace Database\Seeders;

use App\Order\Infrastructure\Persistence\Models\EloquentOrder;
use App\Order\Infrastructure\Persistence\Models\EloquentOrderLine;
use App\Product\Infrastructure\Persistence\Models\EloquentProduct;
use App\Sale\Infrastructure\Persistence\Models\EloquentSale;
use App\Sale\Infrastructure\Persistence\Models\EloquentSaleLine;
use App\User\Infrastructure\Persistence\Models\EloquentUser;
use App\Table\Infrastructure\Persistence\Models\EloquentTable;
use Illuminate\Database\Seeder;

class SaleSeeder extends Seeder
{
    public function run(): void
    {
        $users = EloquentUser::all();
        $tables = EloquentTable::all();
        $products = EloquentProduct::where('active', true)->get();

        if ($users->isEmpty() || $tables->isEmpty() || $products->isEmpty()) {
            return;
        }

        $ticketNumber = 1;

        // Crear 10 ventas cerradas (historial)
        for ($i = 0; $i < 10; $i++) {
            $table = $tables->random();
            $restaurant = $table->restaurant;

            if (! $restaurant) {
                continue;
            }

            $restaurantUsers = $users->where('restaurant_id', $restaurant->id);
            if ($restaurantUsers->isEmpty()) {
                continue;
            }

            $opener = $restaurantUsers->random();
            $closer = $restaurantUsers->random();
            $openedAt = now()->subDays(rand(1, 15))->subHours(rand(1, 8));
            $closedAt = (clone $openedAt)->addHours(rand(1, 3));

            // Crear orden primero
            $order = EloquentOrder::factory()->create([
                'restaurant_id' => $restaurant->id,
                'table_id' => $table->id,
                'opened_by_user_id' => $opener->id,
                'closed_by_user_id' => $closer->id,
                'diners' => rand(1, 6),
                'opened_at' => $openedAt,
                'closed_at' => $closedAt,
                'status' => 'closed',
            ]);

            $restaurantProducts = $products->where('restaurant_id', $restaurant->id);
            if ($restaurantProducts->isEmpty()) {
                continue;
            }

            $sale = EloquentSale::factory()->create([
                'restaurant_id' => $restaurant->id,
                'order_id' => $order->id,
                'ticket_number' => $ticketNumber++,
                'opened_by_user_id' => $opener->id,
                'closed_by_user_id' => $closer->id,
                'user_id' => $closer->id,
                'opened_at' => $openedAt,
                'closed_at' => $closedAt,
                'value_date' => $closedAt,
            ]);

            // Añadir entre 2 y 6 líneas por venta
            $lineCount = rand(2, 6);
            $total = 0;

            for ($j = 0; $j < $lineCount; $j++) {
                $product = $restaurantProducts->random();
                $quantity = rand(1, 3);
                $linePrice = $product->price;
                $taxPercentage = $product->tax->percentage;

                // Crear order_line
                $orderLine = EloquentOrderLine::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'user_id' => $restaurantUsers->random()->id,
                    'quantity' => $quantity,
                    'price' => $linePrice,
                    'tax_percentage' => $taxPercentage,
                ]);

                // Crear sale_line
                EloquentSaleLine::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'sale_id' => $sale->id,
                    'order_line_id' => $orderLine->id,
                    'product_id' => $product->id,
                    'user_id' => $restaurantUsers->random()->id,
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

        // Crear 3 órdenes abiertas (en curso)
        for ($i = 0; $i < 3; $i++) {
            $table = $tables[$i] ?? $tables->random();
            if (! $table) {
                continue;
            }

            $restaurant = $table->restaurant;
            if (! $restaurant) {
                continue;
            }

            $restaurantUsers = $users->where('restaurant_id', $restaurant->id);
            if ($restaurantUsers->isEmpty()) {
                continue;
            }

            $opener = $restaurantUsers->random();

            $order = EloquentOrder::factory()->create([
                'restaurant_id' => $restaurant->id,
                'table_id' => $table->id,
                'opened_by_user_id' => $opener->id,
                'diners' => rand(1, 4),
                'opened_at' => now()->subMinutes(rand(10, 90)),
                'status' => 'open',
            ]);

            $restaurantProducts = $products->where('restaurant_id', $restaurant->id);
            if ($restaurantProducts->isEmpty()) {
                continue;
            }

            // Añadir entre 1 y 3 líneas
            $lineCount = rand(1, 3);

            for ($j = 0; $j < $lineCount; $j++) {
                $product = $restaurantProducts->random();
                $quantity = rand(1, 2);

                EloquentOrderLine::factory()->create([
                    'restaurant_id' => $restaurant->id,
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'user_id' => $restaurantUsers->random()->id,
                    'quantity' => $quantity,
                    'price' => $product->price,
                    'tax_percentage' => $product->tax->percentage,
                ]);
            }
        }
    }
}
