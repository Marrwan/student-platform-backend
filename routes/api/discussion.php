<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\DiscussionCommentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::prefix('discussions')
        ->name('discussions.')
        ->controller(DiscussionCommentController::class)
        ->group(function (): void {
            Route::get('/', 'index')->middleware('permission:discussion.view:all|discussion.view:own')->name('index');
            Route::post('/', 'store')->middleware('permission:discussion.create:own')->name('store');
            Route::post('/{commentId}/upvote', 'upvote')->middleware('permission:discussion.create:own')->name('upvote');
            Route::post('/{commentId}/pin', 'pin')->middleware('permission:discussion.pin:all')->name('pin');
        });
});
