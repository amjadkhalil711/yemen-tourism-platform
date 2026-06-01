<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landmarks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('external_id')->nullable()->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('categories')->nullable();
            $table->json('category_names')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('google_maps_url', 2048)->nullable();
            $table->json('images')->nullable();
            $table->unsignedInteger('sort_order')->default(999);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['city_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landmarks');
    }
};
