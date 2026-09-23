<?php

namespace App\Services;

use App\Models\AssessmentSubmission;
use App\Models\DiscussionComment;
use App\Models\ProjectSubmission;
use App\Models\StudentMetric;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StudentRecognitionService
{
    /**
     * Calculate and save student metrics for a specific period.
     */
    public function calculateMetrics(string $periodType = 'weekly', ?string $periodIdentifier = null): void
    {
        $periodIdentifier ??= $periodType === 'weekly' ? date('Y-\WW') : date('Y-m');

        DB::transaction(function () use ($periodType, $periodIdentifier) {
            $students = User::query()->role('Student')->get();

            $calculated = [];

            foreach ($students as $student) {
                // 1. Accuracy (35%)
                $accuracyPoints = (int) round(($student->total_score ?? 0) * 0.35);

                // 2. Punctuality (25%)
                $onTimeSubmissions = AssessmentSubmission::query()
                    ->where('user_id', $student->id)
                    ->where('is_late', false)
                    ->count();
                $punctualityPoints = $onTimeSubmissions * 10;

                // 3. Streak (20%)
                $streakPoints = ($student->streak_count ?? 0) * 5;

                // 4. Community (10%)
                $upvotesCount = DiscussionComment::query()
                    ->where('user_id', $student->id)
                    ->sum('upvotes_count');
                $communityPoints = (int) ($upvotesCount * 2);

                // 5. Project (10%)
                $projectScoreSum = ProjectSubmission::query()
                    ->where('user_id', $student->id)
                    ->sum('score');
                $projectPoints = (int) round($projectScoreSum * 0.1);

                $totalRankScore = $accuracyPoints + $punctualityPoints + $streakPoints + $communityPoints + $projectPoints;

                $calculated[] = [
                    'user_id' => $student->id,
                    'accuracy_points' => $accuracyPoints,
                    'punctuality_points' => $punctualityPoints,
                    'streak_points' => $streakPoints,
                    'community_points' => $communityPoints,
                    'project_points' => $projectPoints,
                    'total_rank_score' => $totalRankScore,
                ];
            }

            // Sort by total_rank_score descending
            usort($calculated, fn ($a, $b) => $b['total_rank_score'] <=> $a['total_rank_score']);

            // Save metrics with assigned ranks
            foreach ($calculated as $index => $item) {
                StudentMetric::query()->updateOrCreate(
                    [
                        'user_id' => $item['user_id'],
                        'period_type' => $periodType,
                        'period_identifier' => $periodIdentifier,
                    ],
                    [
                        'accuracy_points' => $item['accuracy_points'],
                        'punctuality_points' => $item['punctuality_points'],
                        'streak_points' => $item['streak_points'],
                        'community_points' => $item['community_points'],
                        'project_points' => $item['project_points'],
                        'total_rank_score' => $item['total_rank_score'],
                        'rank' => $index + 1,
                    ]
                );

                if ($index === 0) {
                    $topUser = User::find($item['user_id']);
                    if ($topUser) {
                        app(WebhookNotificationService::class)->notifyTopStudent($topUser, $periodType, 1);
                    }
                }
            }
        });
    }

    /**
     * Get leaderboard for a period.
     */
    public function getLeaderboard(string $periodType = 'weekly', ?string $periodIdentifier = null, int $perPage = 20): LengthAwarePaginator
    {
        $periodIdentifier ??= $periodType === 'weekly' ? date('Y-\WW') : date('Y-m');

        return StudentMetric::query()
            ->with('user')
            ->where('period_type', $periodType)
            ->where('period_identifier', $periodIdentifier)
            ->orderBy('rank', 'asc')
            ->paginate($perPage);
    }
}
