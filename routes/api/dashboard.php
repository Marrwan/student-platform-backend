<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('dashboard')->name('dashboard.')->group(function (): void {
    Route::get('/stats', [DashboardController::class, 'stats'])->name('stats');
    Route::get('/progress-stats', [DashboardController::class, 'progressStats'])->name('progress-stats');
    Route::get('/pending-assignments', [DashboardController::class, 'pendingAssignments'])->name('pending-assignments');
    Route::get('/corrections-needed', [DashboardController::class, 'correctionsNeeded'])->name('corrections-needed');
    Route::get('/recent-submissions', [DashboardController::class, 'recentSubmissions'])->name('recent-submissions');
    Route::get('/today-project', [DashboardController::class, 'todayProject'])->name('today-project');
});
