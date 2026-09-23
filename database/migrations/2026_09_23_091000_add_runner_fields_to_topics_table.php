<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->string('runner_type')->default('browser_js')->after('type'); // browser_js, html_css, node_js, php, python
            $table->json('sandbox_config')->nullable()->after('runner_type');
        });
    }

    public function down(): void
    {
        Schema::table('topics', function (Blueprint $table) {
            $table->dropColumn(['runner_type', 'sandbox_config']);
        });
    }
};
