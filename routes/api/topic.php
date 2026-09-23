<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\TopicController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('topics')
        ->name('topics.')
        ->controller(TopicController::class)
        ->group(function (): void {
            Route::post('/', 'store')->middleware('permission:topic.create:all')->name('store');
            Route::get('/{topicId}', 'show')->middleware('permission:topic.view:all|topic.view:own')->name('show');
            Route::get('/{topicId}/discussions', [\App\Http\Controllers\Api\V1\DiscussionCommentController::class, 'index'])->middleware('permission:discussion.view:all|discussion.view:own')->name('discussions');
            Route::post('/{topicId}/discussions', [\App\Http\Controllers\Api\V1\DiscussionCommentController::class, 'store'])->middleware('permission:discussion.create:own')->name('discussions.store');
            Route::match(['put', 'patch'], '/{topicId}', 'update')->middleware('permission:topic.edit:all|topic.edit:own')->name('update');
            Route::delete('/{topicId}', 'destroy')->middleware('permission:topic.delete:all')->name('destroy');
        });
});
