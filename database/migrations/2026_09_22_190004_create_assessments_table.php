<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('assessable_type'); // App\Models\Topic or App\Models\Module
            $table->uuid('assessable_id');
            $table->string('title');
            $table->enum('type', ['quiz', 'coding'])->default('coding');
            $table->integer('passing_score')->default(70);
            $table->integer('time_limit_minutes')->nullable();
            $table->decimal('late_fee_amount', 10, 2)->default(0.00);
            $table->timestamps();

            $table->index(['assessable_type', 'assessable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
