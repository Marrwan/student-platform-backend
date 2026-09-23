<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssessmentSubmission;
use App\Models\Enrollment;
use App\Models\ProjectSubmission;
use App\Models\StudentMetric;
use App\Models\TopicProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Overall student dashboard stats.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $enrolledCount = Enrollment::query()->where('user_id', $user->id)->count();
        $completedTopicsCount = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $submissionsCount = AssessmentSubmission::query()->where('user_id', $user->id)->count();

        $weeklyMetric = StudentMetric::query()
            ->where('user_id', $user->id)
            ->where('period_type', 'weekly')
            ->where('period_identifier', date('Y-\WW'))
            ->first();

        return response()->json([
            'stats' => [
                'total_score' => (int) $user->total_score,
                'streak_count' => (int) $user->streak_count,
                'enrolled_courses' => $enrolledCount,
                'completed_topics' => $completedTopicsCount,
                'total_submissions' => $submissionsCount,
                'current_weekly_rank' => $weeklyMetric ? (int) $weeklyMetric->rank : null,
            ],
        ]);
    }

    /**
     * Overall learning progress statistics.
     */
    public function progressStats(Request $request): JsonResponse
    {
        $user = $request->user();

        $completedCount = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $inProgressCount = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->count();

        return response()->json([
            'stats' => [
                'completed' => $completedCount,
                'in_progress' => $inProgressCount,
            ],
        ]);
    }

    /**
     * Pending topics and assessments for student.
     */
    public function pendingAssignments(Request $request): JsonResponse
    {
        $user = $request->user();

        $unlockedTopics = TopicProgress::query()
            ->with(['topic.module'])
            ->where('user_id', $user->id)
            ->whereIn('status', ['unlocked', 'in_progress'])
            ->get();

        return response()->json([
            'assignments' => $unlockedTopics,
        ]);
    }

    /**
     * Submissions needing correction / revision.
     */
    public function correctionsNeeded(Request $request): JsonResponse
    {
        $user = $request->user();

        $corrections = ProjectSubmission::query()
            ->with(['project'])
            ->where('user_id', $user->id)
            ->where('status', 'rejected')
            ->get();

        return response()->json([
            'corrections' => $corrections,
        ]);
    }

    /**
     * Recent submissions across assessments & projects.
     */
    public function recentSubmissions(Request $request): JsonResponse
    {
        $user = $request->user();

        $assessments = AssessmentSubmission::query()
            ->where('user_id', $user->id)
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        $projects = ProjectSubmission::query()
            ->with(['project'])
            ->where('user_id', $user->id)
            ->latest('submitted_at')
            ->limit(5)
            ->get();

        return response()->json([
            'recent_assessments' => $assessments,
            'recent_projects' => $projects,
        ]);
    }

    /**
     * Today's active learning topic or project.
     */
    public function todayProject(Request $request): JsonResponse
    {
        $user = $request->user();

        $activeTopicProgress = TopicProgress::query()
            ->with(['topic.module'])
            ->where('user_id', $user->id)
            ->where('status', 'unlocked')
            ->orderBy('created_at', 'asc')
            ->first();

        return response()->json([
            'project' => $activeTopicProgress?->topic,
        ]);
    }
}
