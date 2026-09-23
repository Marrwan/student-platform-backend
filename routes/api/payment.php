<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\PaymentController;
use Illuminate\Support\Facades\Route;

// Public webhook route
Route::post('payments/webhook', [PaymentController::class, 'webhook'])->name('payments.webhook');

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('payments')
        ->name('payments.')
        ->controller(PaymentController::class)
        ->group(function (): void {
            Route::get('/', 'history')->middleware('permission:course.view:all|course.view:own')->name('index');
            Route::get('/history', 'history')->middleware('permission:course.view:all|course.view:own')->name('history');
            Route::post('/initialize-late-fee', 'initializeLateFee')->middleware('permission:course.view:all|course.view:own')->name('initialize-late-fee');
            Route::post('/verify', 'verify')->middleware('permission:course.view:all|course.view:own')->name('verify');
        });
});
