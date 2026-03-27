<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('uuid')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('order_id')->after('restaurant_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('user_id')->after('closed_by_user_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('value_date')->after('closed_at');
        });

        // Update status column before renaming
        Schema::table('sales', function (Blueprint $table) {
            $table->renameColumn('status', 'old_status');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('old_status');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['restaurant_id', 'order_id', 'user_id']);
            $table->dropColumn(['restaurant_id', 'order_id', 'user_id', 'value_date']);
            $table->string('status')->default('closed');
        });
    }
};
