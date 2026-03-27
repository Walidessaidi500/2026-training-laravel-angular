<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('id')->constrained('restaurants')->cascadeOnDelete();
            $table->string('pin')->nullable()->after('image_src');
        });

        // Asignar un restaurante por defecto a los usuarios existentes si hay alguno
        if (DB::table('restaurants')->exists()) {
            $firstRestaurantId = DB::table('restaurants')->first()?->id;
            if ($firstRestaurantId) {
                DB::table('users')->whereNull('restaurant_id')->update(['restaurant_id' => $firstRestaurantId]);
            }
        }

        // Hacer que restaurant_id no sea nullable
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['restaurant_id']);
            $table->dropColumn(['restaurant_id', 'pin']);
        });
    }
};
