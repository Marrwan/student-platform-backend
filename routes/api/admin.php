<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AdminController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('admin')
        ->name('admin.')
        ->controller(AdminController::class)
        ->group(function (): void {
            Route::get('/stats', 'stats')->name('stats');
            Route::get('/users', 'users')->name('users.index');
            Route::post('/users', 'storeUser')->name('users.store');
            Route::put('/users/{userId}/role', 'updateUserRole')->name('users.role');
            Route::patch('/users/{userId}/status', 'toggleUserStatus')->name('users.status');
            Route::get('/roles', 'roles')->name('roles.index');
            Route::post('/roles', 'storeRole')->name('roles.store');
            Route::get('/submissions', 'submissions')->name('submissions.index');
            Route::post('/submissions/{submissionId}/grade', 'gradeSubmission')->name('submissions.grade');
        });
});
