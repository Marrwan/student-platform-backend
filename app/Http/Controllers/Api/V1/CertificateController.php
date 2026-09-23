<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CertificateController extends Controller
{
    public function __construct(
        protected CertificateService $certificateService
    ) {}

    /**
     * List user certificates.
     */
    public function index(Request $request): JsonResponse
    {
        $certificates = Certificate::query()
            ->with(['course'])
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'data' => $certificates,
        ]);
    }

    /**
     * Show single certificate details.
     */
    public function show(Request $request, string $uuid): JsonResponse
    {
        $certificate = Certificate::query()
            ->with(['course', 'user'])
            ->where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'data' => $certificate,
        ]);
    }

    /**
     * Download certificate PDF.
     */
    public function download(Request $request, string $uuid): Response
    {
        $certificate = Certificate::query()
            ->where('uuid', $uuid)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return $this->certificateService->generatePdfResponse($certificate);
    }

    /**
     * Public endpoint to verify certificate authenticity.
     */
    public function verify(string $uuid): JsonResponse
    {
        $certificate = Certificate::query()
            ->with(['course', 'user'])
            ->where('uuid', $uuid)
            ->orWhere('certificate_code', $uuid)
            ->first();

        if (! $certificate) {
            return response()->json([
                'valid' => false,
                'message' => 'Certificate not found or invalid.',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'certificate' => [
                'code' => $certificate->certificate_code,
                'uuid' => $certificate->uuid,
                'issued_at' => $certificate->issued_at,
                'student_name' => $certificate->user->full_name,
                'course_title' => $certificate->course->title,
            ],
        ]);
    }
}
