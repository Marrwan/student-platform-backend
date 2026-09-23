<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    require __DIR__.'/api/auth.php';
    require __DIR__.'/api/course.php';
    require __DIR__.'/api/module.php';
    require __DIR__.'/api/topic.php';
    require __DIR__.'/api/progression.php';
    require __DIR__.'/api/assessment.php';
    require __DIR__.'/api/payment.php';
    require __DIR__.'/api/discussion.php';
    require __DIR__.'/api/project.php';
    require __DIR__.'/api/leaderboard.php';
    require __DIR__.'/api/certificate.php';
    require __DIR__.'/api/dashboard.php';
    require __DIR__.'/api/admin.php';

    Route::get('/notifications', function () {
        return response()->json(['notifications' => []]);
    });
});
