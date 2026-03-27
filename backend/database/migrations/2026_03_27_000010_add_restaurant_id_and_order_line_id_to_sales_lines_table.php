<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales_lines', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('uuid')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('order_line_id')->after('sale_id')->constrained('order_lines')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sales_lines', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['restaurant_id', 'order_line_id']);
            $table->dropColumn(['restaurant_id', 'order_line_id']);
        });
    }
};
