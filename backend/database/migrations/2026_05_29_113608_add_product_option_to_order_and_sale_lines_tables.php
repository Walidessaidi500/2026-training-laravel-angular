<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('order_lines', function (Blueprint $table) {
            $table->json('product_option')->nullable()->after('product_id');
        });

        Schema::table('sales_lines', function (Blueprint $table) {
            $table->json('product_option')->nullable()->after('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_lines', function (Blueprint $table) {
            $table->dropColumn('product_option');
        });

        Schema::table('sales_lines', function (Blueprint $table) {
            $table->dropColumn('product_option');
        });
    }
};
