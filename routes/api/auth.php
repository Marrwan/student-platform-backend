<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthenticationController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->name('auth.')->group(function (): void {
    Route::post('/register', [RegisterController::class, 'register'])->name('register');
    Route::post('/login', [AuthenticationController::class, 'login'])->name('login');
    Route::post('/verify-email', [AuthenticationController::class, 'verifyEmail'])->name('verify-email');
    Route::post('/resend-verification', [AuthenticationController::class, 'resendVerification'])->name('resend-verification');
    Route::post('/forgot-password', [AuthenticationController::class, 'forgotPassword'])->name('forgot-password');
    Route::post('/reset-password', [AuthenticationController::class, 'resetPassword'])->name('reset-password');

    Route::middleware(['auth:sanctum'])->group(function (): void {
        Route::get('/me', [AuthenticationController::class, 'me'])->name('me');
        Route::get('/profile', [AuthenticationController::class, 'me'])->name('profile');
        Route::put('/profile', [AuthenticationController::class, 'updateProfile'])->name('update-profile');
        Route::put('/notifications', [AuthenticationController::class, 'updateNotifications'])->name('update-notifications');
        Route::get('/notifications', function () {
            return response()->json(['notifications' => []]);
        })->name('notifications');
        Route::post('/change-password', [AuthenticationController::class, 'changePassword'])->name('change-password');
        Route::get('/activity-heatmap', [\App\Http\Controllers\Api\V1\ActivityController::class, 'getHeatmap'])->name('activity-heatmap');
        Route::get('/users/{user}/activity-heatmap', [\App\Http\Controllers\Api\V1\ActivityController::class, 'getHeatmap'])->name('users.activity-heatmap');
        Route::post('/logout', [AuthenticationController::class, 'logout'])->name('logout');
        Route::get('/sessions', [AuthenticationController::class, 'sessions'])->name('sessions.index');
        Route::delete('/sessions/{tokenId}', [AuthenticationController::class, 'destroySession'])->name('sessions.destroy');
        Route::delete('/sessions', [AuthenticationController::class, 'destroyOtherSessions'])->name('sessions.destroy-others');
    });
});
