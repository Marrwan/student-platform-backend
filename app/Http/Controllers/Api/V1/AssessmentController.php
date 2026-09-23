<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Assessment\StoreAssessmentRequest;
use App\Http\Resources\AssessmentResource;
use App\Models\Assessment;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class AssessmentController extends Controller
{
    public function __construct(
        public AssessmentService $assessmentService
    ) {}

    public function store(StoreAssessmentRequest $request): JsonResponse
    {
        $assessment = $this->assessmentService->createAssessment($request->validated());

        return response()->json([
            'message' => 'Assessment created successfully.',
            'data' => AssessmentResource::make($assessment),
        ], Response::HTTP_CREATED);
    }

    public function show(string $id): AssessmentResource
    {
        $assessment = $this->assessmentService->getAssessmentDetails($id);

        return AssessmentResource::make($assessment);
    }
}
