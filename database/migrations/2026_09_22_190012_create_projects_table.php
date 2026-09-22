<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('starter_template_url')->nullable();
            $table->enum('submission_type', ['frontend_iframe', 'github', 'zip', 'all'])->default('frontend_iframe');
            $table->json('rubrics')->nullable();
            $table->timestamps();
        });

        Schema::create('project_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('live_url')->nullable();
            $table->string('github_url')->nullable();
            $table->longText('preview_html')->nullable();
            $table->integer('score')->default(0);
            $table->enum('status', ['pending', 'reviewed', 'accepted', 'rejected'])->default('pending');
            $table->text('admin_feedback')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->unique(['user_id', 'project_id']);
        });

        Schema::create('student_metrics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('period_type', ['weekly', 'monthly']);
            $table->string('period_identifier'); // e.g. "2026-W38" or "2026-09"
            $table->decimal('total_rank_score', 8, 2)->default(0.00);
            $table->integer('accuracy_points')->default(0);
            $table->integer('punctuality_points')->default(0);
            $table->integer('streak_points')->default(0);
            $table->integer('community_points')->default(0);
            $table->integer('project_points')->default(0);
            $table->integer('rank')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'period_type', 'period_identifier']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_metrics');
        Schema::dropIfExists('project_submissions');
        Schema::dropIfExists('projects');
    }
};
