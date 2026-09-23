<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ModuleController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('modules')
        ->name('modules.')
        ->controller(ModuleController::class)
        ->group(function (): void {
            Route::post('/', 'store')->middleware('permission:module.create:all')->name('store');
            Route::match(['put', 'patch'], '/{moduleId}', 'update')->middleware('permission:module.edit:all|module.edit:own')->name('update');
            Route::delete('/{moduleId}', 'destroy')->middleware('permission:module.delete:all')->name('destroy');
        });
});
