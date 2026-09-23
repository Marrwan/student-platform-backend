<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ProgressionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('progression')
        ->name('progression.')
        ->controller(ProgressionController::class)
        ->group(function (): void {
            Route::post('/enroll/{courseId}', 'enroll')->middleware('permission:course.view:all|course.view:own')->name('enroll');
            Route::post('/topics/{topicId}/complete', 'completeTopic')->middleware('permission:topic.view:all|topic.view:own')->name('complete-topic');
        });
});
