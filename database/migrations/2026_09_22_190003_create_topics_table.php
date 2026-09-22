<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('module_id')->constrained('modules')->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->enum('type', ['written', 'video_embed', 'video_link', 'blog_link', 'code_playground'])->default('written');
            $table->longText('content_markdown')->nullable();
            $table->string('video_url')->nullable();
            $table->json('starter_code')->nullable();
            $table->longText('solution_code')->nullable();
            $table->integer('order_index')->default(1);
            $table->integer('estimated_minutes')->default(15);
            $table->integer('deadline_hours')->nullable();
            $table->timestamps();

            $table->index(['module_id', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
    }
};
