<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ProjectSubmissionController;
use Illuminate\Support\Facades\Route;

// Public project showcase gallery route
Route::get('projects/showcase', [ProjectSubmissionController::class, 'showcase'])->name('projects.showcase');

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('projects')
        ->name('projects.')
        ->group(function (): void {
            Route::get('/', [ProjectController::class, 'index'])->middleware('permission:project.view:all|project.view:own')->name('index');
            Route::post('/', [ProjectController::class, 'store'])->middleware('permission:project.create:all')->name('store');
            Route::get('/{id}', [ProjectController::class, 'show'])->middleware('permission:project.view:all|project.view:own')->name('show');
            Route::post('/submit', [ProjectSubmissionController::class, 'submit'])->middleware('permission:project_submission.create:own')->name('submit');
            Route::post('/submissions/{submissionId}/like', [ProjectSubmissionController::class, 'toggleLike'])->middleware('permission:project_submission.create:own')->name('like');
            Route::post('/submissions/{submissionId}/feature', [ProjectSubmissionController::class, 'toggleFeature'])->middleware('permission:project_submission.review:all')->name('feature');
            Route::post('/submissions/{submissionId}/grade', [ProjectSubmissionController::class, 'grade'])->middleware('permission:project_submission.review:all')->name('grade');
        });
});
