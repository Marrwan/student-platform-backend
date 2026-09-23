<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Project\GradeProjectSubmissionRequest;
use App\Http\Requests\Api\V1\Project\SubmitProjectRequest;
use App\Http\Resources\ProjectSubmissionResource;
use App\Models\ProjectSubmission;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectSubmissionController extends Controller
{
    public function __construct(
        public ProjectService $projectService
    ) {}

    /**
     * Public project showcase feed.
     */
    public function showcase(Request $request): AnonymousResourceCollection
    {
        $feed = $this->projectService->getShowcaseFeed($request->query('course_id'));

        return ProjectSubmissionResource::collection($feed);
    }

    /**
     * Submit project (live preview URL / HTML / GitHub).
     */
    public function submit(SubmitProjectRequest $request): JsonResponse
    {
        $submission = $this->projectService->submitProject($request->user(), $request->validated());

        return response()->json([
            'message' => 'Project submitted successfully for showcase!',
            'data' => ProjectSubmissionResource::make($submission),
        ], Response::HTTP_CREATED);
    }

    /**
     * Toggle like/upvote on project submission.
     */
    public function toggleLike(Request $request, string $submissionId): JsonResponse
    {
        $submission = ProjectSubmission::query()->findOrFail($submissionId);
        $liked = $this->projectService->toggleLike($request->user(), $submission);

        return response()->json([
            'liked' => $liked,
            'likes_count' => $submission->fresh()->likes_count,
        ]);
    }

    /**
     * Admin toggle feature flag on project submission.
     */
    public function toggleFeature(Request $request, string $submissionId): JsonResponse
    {
        $submission = ProjectSubmission::query()->findOrFail($submissionId);
        $featured = $this->projectService->toggleFeature($submission);

        return response()->json([
            'is_featured' => $featured,
            'message' => $featured ? 'Project featured on public showcase!' : 'Project un-featured.',
        ]);
    }

    /**
     * Grade student project submission.
     */
    public function grade(GradeProjectSubmissionRequest $request, string $submissionId): JsonResponse
    {
        $submission = ProjectSubmission::query()->findOrFail($submissionId);
        $graded = $this->projectService->gradeSubmission($request->user(), $submission, $request->validated());

        return response()->json([
            'message' => 'Project submission graded successfully.',
            'data' => ProjectSubmissionResource::make($graded),
        ]);
    }
}
