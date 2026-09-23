<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Topic;
use App\Models\TopicProgress;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class CertificateService
{
    /**
     * Check course completion and issue certificate if eligible.
     */
    public function issueCertificateIfEligible(User $user, Course $course): ?Certificate
    {
        $existing = Certificate::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        // Calculate total topics in course vs completed topics
        $totalTopicsCount = Topic::query()
            ->whereHas('module', fn ($q) => $q->where('course_id', $course->id))
            ->count();

        if ($totalTopicsCount === 0) {
            return null;
        }

        $completedTopicsCount = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->whereHas('topic.module', fn ($q) => $q->where('course_id', $course->id))
            ->count();

        if ($completedTopicsCount < $totalTopicsCount) {
            return null;
        }

        // Generate unique certificate
        $code = 'CERT-' . strtoupper(Str::random(8));

        $certificate = Certificate::query()->create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'course_id' => $course->id,
            'certificate_code' => $code,
            'issued_at' => now(),
            'meta_data' => [
                'total_topics' => $totalTopicsCount,
                'course_title' => $course->title,
                'student_name' => $user->full_name,
            ],
        ]);

        // Mark enrollment completed
        Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        return $certificate;
    }

    /**
     * Generate PDF stream for certificate.
     */
    public function generatePdfResponse(Certificate $certificate): Response
    {
        $certificate->load(['user', 'course']);

        $pdf = Pdf::loadView('certificates.certificate', [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
        ])->setPaper('a4', 'landscape');

        return $pdf->download("certificate-{$certificate->certificate_code}.pdf");
    }
}
