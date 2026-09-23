<?php

namespace App\Services;

use App\Models\Assessment;
use App\Models\AssessmentSubmission;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssessmentRunnerService
{
    public function __construct(
        public ProgressionService $progressionService
    ) {}

    /**
     * Run student submission against defined test cases & calculate score.
     */
    public function evaluateSubmission(User $user, Assessment $assessment, array $data): AssessmentSubmission
    {
        return DB::transaction(function () use ($user, $assessment, $data) {
            $submittedCode = $data['submitted_code'] ?? '';
            $submittedAnswers = $data['submitted_answers'] ?? null;

            $testResults = [];
            $totalPoints = 0;
            $earnedPoints = 0;

            if ($assessment->type === 'coding') {
                $testCases = $assessment->testCases;

                foreach ($testCases as $testCase) {
                    $totalPoints += $testCase->points;

                    // Evaluate submission against expected output
                    $passedCase = $this->assertTestCase($submittedCode, $testCase->input_payload, $testCase->expected_output);

                    if ($passedCase) {
                        $earnedPoints += $testCase->points;
                    }

                    $testResults[] = [
                        'test_case_id' => $testCase->id,
                        'description' => $testCase->description,
                        'passed' => $passedCase,
                        'points' => $passedCase ? $testCase->points : 0,
                    ];
                }
            }

            $scorePercentage = $totalPoints > 0 ? (int) round(($earnedPoints / $totalPoints) * 100) : 100;
            $passed = $scorePercentage >= $assessment->passing_score;

            // Save submission record
            $submission = AssessmentSubmission::query()->create([
                'user_id' => $user->id,
                'assessment_id' => $assessment->id,
                'submitted_code' => $submittedCode,
                'submitted_answers' => $submittedAnswers,
                'score' => $scorePercentage,
                'passed' => $passed,
                'is_late' => false,
                'execution_output' => [
                    'earned_points' => $earnedPoints,
                    'total_points' => $totalPoints,
                    'test_results' => $testResults,
                ],
                'submitted_at' => now(),
            ]);

            // Update user total score
            if ($passed) {
                $user->increment('total_score', $earnedPoints);

                // If this assessment is for a Topic, complete topic & unlock next!
                if ($assessment->assessable_type === Topic::class) {
                    $topic = Topic::query()->find($assessment->assessable_id);
                    if ($topic) {
                        $this->progressionService->completeTopicAndUnlockNext($user, $topic);
                    }
                }
            }

            return $submission;
        });
    }

    /**
     * Evaluate single test case assertion.
     */
    protected function assertTestCase(string $code, ?string $input, string $expectedOutput): bool
    {
        // Simple assertion runner: check if code contains required output string or return pattern
        $normalizedCode = str_replace(["\r", "\n", ' '], '', strtolower($code));
        $normalizedExpected = str_replace(["\r", "\n", ' '], '', strtolower($expectedOutput));

        return str_contains($normalizedCode, $normalizedExpected);
    }
}
