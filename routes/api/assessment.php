<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\AssessmentSubmissionController;
use App\Http\Controllers\Api\V1\TestCaseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('assessments')
        ->name('assessments.')
        ->group(function (): void {
            Route::post('/', [AssessmentController::class, 'store'])->middleware('permission:assessment.create:all')->name('store');
            Route::get('/{id}', [AssessmentController::class, 'show'])->middleware('permission:assessment.view:all|assessment.view:own')->name('show');
            Route::post('/test-cases', [TestCaseController::class, 'store'])->middleware('permission:assessment.create:all')->name('test-cases.store');
            Route::post('/submit', [AssessmentSubmissionController::class, 'submit'])->middleware('permission:assessment.evaluate:all|assessment.evaluate:own')->name('submit');
        });
});
