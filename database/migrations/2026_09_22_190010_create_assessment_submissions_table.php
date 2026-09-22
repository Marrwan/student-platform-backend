<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->longText('submitted_code')->nullable();
            $table->json('submitted_answers')->nullable();
            $table->integer('score')->default(0);
            $table->boolean('passed')->default(false);
            $table->boolean('is_late')->default(false);
            $table->boolean('late_fee_paid')->default(false);
            $table->json('execution_output')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->index(['user_id', 'assessment_id']);
        });

        Schema::create('discussion_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('commentable_type');
            $table->uuid('commentable_id');
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('parent_id')->nullable();
            $table->text('body_markdown');
            $table->boolean('is_pinned')->default(false);
            $table->integer('upvotes_count')->default(0);
            $table->timestamps();

            $table->index(['commentable_type', 'commentable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discussion_comments');
        Schema::dropIfExists('assessment_submissions');
    }
};
