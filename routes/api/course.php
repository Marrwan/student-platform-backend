<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CourseController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('courses')
        ->name('courses.')
        ->controller(CourseController::class)
        ->group(function (): void {
            Route::get('/', 'index')->middleware('permission:course.view:all|course.view:own')->name('index');
            Route::post('/', 'store')->middleware('permission:course.create:all')->name('store');
            Route::get('/{courseId}', 'show')->middleware('permission:course.view:all|course.view:own')->name('show');
            Route::match(['put', 'patch'], '/{courseId}', 'update')->middleware('permission:course.edit:all|course.edit:own')->name('update');
            Route::delete('/{courseId}', 'destroy')->middleware('permission:course.delete:all')->name('destroy');
        });
});
