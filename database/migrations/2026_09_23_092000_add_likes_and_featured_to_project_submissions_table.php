<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_submissions', function (Blueprint $table) {
            $table->unsignedInteger('likes_count')->default(0)->after('score');
            $table->boolean('is_featured')->default(false)->after('likes_count');
        });

        Schema::create('project_submission_likes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_submission_id')->constrained('project_submissions')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['project_submission_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_submission_likes');

        Schema::table('project_submissions', function (Blueprint $table) {
            $table->dropColumn(['likes_count', 'is_featured']);
        });
    }
};
