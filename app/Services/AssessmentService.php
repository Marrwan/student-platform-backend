<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\TestCase;

class AssessmentService
{
    /**
     * Create a new assessment attached to a Topic or Module.
     */
    public function createAssessment(array $data): Assessment
    {
        return Assessment::query()->create([
            'assessable_type' => $data['assessable_type'],
            'assessable_id' => $data['assessable_id'],
            'title' => $data['title'],
            'type' => $data['type'],
            'passing_score' => $data['passing_score'] ?? 70,
            'time_limit_minutes' => $data['time_limit_minutes'] ?? null,
            'late_fee_amount' => $data['late_fee_amount'] ?? 0.00,
        ]);
    }

    /**
     * Add a unit test case to an assessment.
     */
    public function addTestCase(array $data): TestCase
    {
        return TestCase::query()->create([
            'assessment_id' => $data['assessment_id'],
            'description' => $data['description'],
            'input_payload' => $data['input_payload'] ?? null,
            'expected_output' => $data['expected_output'],
            'is_hidden' => $data['is_hidden'] ?? false,
            'points' => $data['points'] ?? 10,
        ]);
    }

    /**
     * Get assessment with test cases.
     */
    public function getAssessmentDetails(string $id): Assessment
    {
        return Assessment::query()->with('testCases')->findOrFail($id);
    }
}
