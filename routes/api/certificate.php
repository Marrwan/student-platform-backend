<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\CertificateController;
use Illuminate\Support\Facades\Route;

// Public verification route
Route::get('certificates/verify/{uuid}', [CertificateController::class, 'verify'])->name('certificates.verify');

// Authenticated certificate routes
Route::middleware('auth:sanctum')->prefix('certificates')->name('certificates.')->group(function (): void {
    Route::get('/', [CertificateController::class, 'index'])->name('index');
    Route::get('/{uuid}', [CertificateController::class, 'show'])->name('show');
    Route::get('/{uuid}/download', [CertificateController::class, 'download'])->name('download');
});
