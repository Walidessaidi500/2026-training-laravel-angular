<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->after('id')->constrained('restaurants')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });
    }
};
