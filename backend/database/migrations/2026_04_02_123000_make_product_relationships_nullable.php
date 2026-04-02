<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Eliminar constraints actuales
            $table->dropForeign(['family_id']);
            $table->dropForeign(['tax_id']);

            // Hacer columnas nullable y cambiar action a set null
            $table->unsignedBigInteger('family_id')->nullable()->change();
            $table->unsignedBigInteger('tax_id')->nullable()->change();

            // Re-añadir con set null
            $table->foreign('family_id')->references('id')->on('families')->onDelete('set null');
            $table->foreign('tax_id')->references('id')->on('taxes')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['family_id']);
            $table->dropForeign(['tax_id']);

            $table->unsignedBigInteger('family_id')->nullable(false)->change();
            $table->unsignedBigInteger('tax_id')->nullable(false)->change();

            $table->foreign('family_id')->references('id')->on('families')->onDelete('restrict');
            $table->foreign('tax_id')->references('id')->on('taxes')->onDelete('restrict');
        });
    }
};
