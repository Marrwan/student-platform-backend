<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentSubmission;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Topic;
use App\Models\User;
use Carbon\Carbon;

class DeadlineLockService
{
    /**
     * Check if an assessment is overdue for a student.
     */
    public function isAssessmentOverdue(User $user, Assessment $assessment): bool
    {
        if ($assessment->assessable_type === Topic::class) {
            $topic = Topic::query()->with('module.course')->find($assessment->assessable_id);
            if (! $topic || ! $topic->deadline_hours) {
                return false; // No deadline configured
            }

            $enrollment = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $topic->module->course_id)
                ->first();

            if (! $enrollment) {
                return false;
            }

            // Overdue if current time exceeds enrollment date + deadline_hours
            $deadline = Carbon::parse($enrollment->enrolled_at)->addHours($topic->deadline_hours);

            return now()->greaterThan($deadline);
        }

        return false;
    }

    /**
     * Check if student requires a paid late fee before submitting.
     */
    public function requiresLateFeePayment(User $user, Assessment $assessment): bool
    {
        if (! $this->isAssessmentOverdue($user, $assessment)) {
            return false;
        }

        // If late fee is 0, no payment required
        if ($assessment->late_fee_amount <= 0) {
            return false;
        }

        // Check if student has already paid late fee for this assessment
        $paidLateFee = AssessmentSubmission::query()
            ->where('user_id', $user->id)
            ->where('assessment_id', $assessment->id)
            ->where('late_fee_paid', true)
            ->exists();

        return ! $paidLateFee;
    }
}
