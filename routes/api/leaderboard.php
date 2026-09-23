<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\LeaderboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('leaderboard')->name('leaderboard.')->group(function (): void {
    Route::get('/weekly', [LeaderboardController::class, 'weekly'])->name('weekly');
    Route::get('/monthly', [LeaderboardController::class, 'monthly'])->name('monthly');
    Route::get('/me', [LeaderboardController::class, 'myRank'])->name('my-rank');
});
