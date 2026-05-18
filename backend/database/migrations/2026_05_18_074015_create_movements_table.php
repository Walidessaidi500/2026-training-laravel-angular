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
        Schema::create('movements', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->uuid('uuid')->unique();
            $blueprint->unsignedBigInteger('user_id')->nullable();
            $blueprint->unsignedBigInteger('restaurant_id')->nullable();
            $blueprint->string('user_name')->nullable();
            $blueprint->string('user_email')->nullable();
            $blueprint->string('action');
            $blueprint->text('description');
            $blueprint->string('resource_type')->nullable();
            $blueprint->string('resource_id')->nullable();
            $blueprint->json('changes')->nullable();
            $blueprint->string('ip_address')->nullable();
            $blueprint->string('user_agent')->nullable();
            $blueprint->timestamps();

            $blueprint->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $blueprint->foreign('restaurant_id')->references('id')->on('restaurants')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
