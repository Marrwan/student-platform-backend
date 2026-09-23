<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\ProjectSubmissionLike;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProjectService
{
    /**
     * Create a capstone project.
     */
    public function createProject(array $data): Project
    {
        return Project::query()->create([
            'course_id' => $data['course_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'starter_template_url' => $data['starter_template_url'] ?? null,
            'submission_type' => $data['submission_type'] ?? 'frontend_iframe',
            'rubrics' => $data['rubrics'] ?? null,
        ]);
    }

    /**
     * Submit student project (live preview URL / HTML code / GitHub).
     */
    public function submitProject(User $user, array $data): ProjectSubmission
    {
        return ProjectSubmission::query()->updateOrCreate(
            [
                'project_id' => $data['project_id'],
                'user_id' => $user->id,
            ],
            [
                'live_url' => $data['live_url'] ?? null,
                'github_url' => $data['github_url'] ?? null,
                'preview_html' => $data['preview_html'] ?? null,
                'status' => 'pending',
                'submitted_at' => now(),
            ]
        );
    }

    /**
     * Toggle upvote/like for a project submission.
     */
    public function toggleLike(User $user, ProjectSubmission $submission): bool
    {
        $existing = ProjectSubmissionLike::query()
            ->where('project_submission_id', $submission->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $submission->decrement('likes_count');
            return false;
        }

        ProjectSubmissionLike::query()->create([
            'project_submission_id' => $submission->id,
            'user_id' => $user->id,
        ]);

        $submission->increment('likes_count');
        return true;
    }

    /**
     * Toggle featuring a project submission for public showcase homepage.
     */
    public function toggleFeature(ProjectSubmission $submission): bool
    {
        $newStatus = ! $submission->is_featured;
        $submission->update(['is_featured' => $newStatus]);

        if ($newStatus) {
            app(WebhookNotificationService::class)->notifyProjectFeatured($submission);
        }

        return $newStatus;
    }

    /**
     * Get public project showcase gallery feed.
     */
    public function getShowcaseFeed(?string $courseId = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = ProjectSubmission::query()
            ->with(['user', 'project'])
            ->where(function ($q) {
                $q->whereNotNull('live_url')->orWhereNotNull('preview_html');
            });

        if ($courseId) {
            $query->whereHas('project', fn ($q) => $q->where('course_id', $courseId));
        }

        return $query
            ->orderBy('is_featured', 'desc')
            ->orderBy('likes_count', 'desc')
            ->orderBy('submitted_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Grade student project submission.
     */
    public function gradeSubmission(User $reviewer, ProjectSubmission $submission, array $data): ProjectSubmission
    {
        $submission->update([
            'score' => $data['score'],
            'status' => $data['status'],
            'admin_feedback' => $data['admin_feedback'] ?? null,
            'reviewed_by' => $reviewer->id,
        ]);

        return $submission->fresh();
    }
}
