<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Assessment\SubmitAssessmentRequest;
use App\Http\Resources\AssessmentSubmissionResource;
use App\Models\Assessment;
use App\Services\AssessmentRunnerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AssessmentSubmissionController extends Controller
{
    public function __construct(
        public AssessmentRunnerService $assessmentRunnerService
    ) {}

    /**
     * Submit code/answers for automated evaluation.
     */
    public function submit(SubmitAssessmentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $assessment = Assessment::query()->with('testCases')->findOrFail($validated['assessment_id']);

        $submission = $this->assessmentRunnerService->evaluateSubmission(
            $request->user(),
            $assessment,
            $validated
        );

        return response()->json([
            'message' => $submission->passed ? 'Assessment passed!' : 'Assessment failed. Please review test output and retry.',
            'data' => AssessmentSubmissionResource::make($submission),
        ], Response::HTTP_CREATED);
    }
}
