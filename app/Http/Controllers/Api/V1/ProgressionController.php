<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Topic;
use App\Services\ProgressionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProgressionController extends Controller
{
    public function __construct(
        public ProgressionService $progressionService
    ) {}

    /**
     * Enroll authenticated user in a course.
     */
    public function enroll(Request $request, string $courseId): JsonResponse
    {
        $course = Course::query()->findOrFail($courseId);
        $enrollment = $this->progressionService->enrollUserInCourse($request->user(), $course);

        return response()->json([
            'message' => 'Successfully enrolled in course.',
            'data' => $enrollment,
        ], Response::HTTP_CREATED);
    }

    /**
     * Mark a topic as completed and unlock the next sequential topic.
     */
    public function completeTopic(Request $request, string $topicId): JsonResponse
    {
        $topic = Topic::query()->with('module')->findOrFail($topicId);

        if (! $this->progressionService->canUserAccessTopic($request->user(), $topic)) {
            return response()->json([
                'message' => 'Cannot complete a locked topic.',
            ], Response::HTTP_FORBIDDEN);
        }

        $progress = $this->progressionService->completeTopicAndUnlockNext($request->user(), $topic);

        return response()->json([
            'message' => 'Topic completed. Next topic unlocked!',
            'data' => $progress,
        ]);
    }
}
