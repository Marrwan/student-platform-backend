<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Assessment\StoreTestCaseRequest;
use App\Http\Resources\TestCaseResource;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class TestCaseController extends Controller
{
    public function __construct(
        public AssessmentService $assessmentService
    ) {}

    public function store(StoreTestCaseRequest $request): JsonResponse
    {
        $testCase = $this->assessmentService->addTestCase($request->validated());

        return response()->json([
            'message' => 'Test case added successfully.',
            'data' => TestCaseResource::make($testCase),
        ], Response::HTTP_CREATED);
    }
}
