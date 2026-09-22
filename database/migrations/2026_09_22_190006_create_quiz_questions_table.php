<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assessment_id')->constrained('assessments')->onDelete('cascade');
            $table->text('question_text');
            $table->enum('type', ['single_choice', 'multiple_choice'])->default('single_choice');
            $table->integer('points')->default(10);
            $table->timestamps();
        });

        Schema::create('quiz_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('quiz_question_id')->constrained('quiz_questions')->onDelete('cascade');
            $table->text('option_text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_options');
        Schema::dropIfExists('quiz_questions');
    }
};
