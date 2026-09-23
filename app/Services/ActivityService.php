<?php

namespace App\Services;

use App\Models\AssessmentSubmission;
use App\Models\DiscussionComment;
use App\Models\ProjectSubmission;
use App\Models\TopicProgress;
use App\Models\User;
use Carbon\Carbon;

class ActivityService
{
    /**
     * Compute 365-day contribution heatmap and active streak metrics for a student.
     */
    public function getUserHeatmap(User $user, int $days = 365): array
    {
        $startDate = now()->subDays($days - 1)->startOfDay();

        // 1. Fetch completed topics
        $topics = TopicProgress::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $startDate)
            ->get(['completed_at']);

        // 2. Fetch assessment submissions
        $assessments = AssessmentSubmission::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->get(['created_at']);

        // 3. Fetch discussion comments
        $discussions = DiscussionComment::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->get(['created_at']);

        // 4. Fetch project submissions
        $projects = ProjectSubmission::query()
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->get(['created_at']);

        $activityByDate = [];

        foreach ($topics as $item) {
            $date = Carbon::parse($item->completed_at)->format('Y-m-d');
            $activityByDate[$date] = ($activityByDate[$date] ?? 0) + 1;
        }

        foreach ($assessments as $item) {
            $date = Carbon::parse($item->created_at)->format('Y-m-d');
            $activityByDate[$date] = ($activityByDate[$date] ?? 0) + 1;
        }

        foreach ($discussions as $item) {
            $date = Carbon::parse($item->created_at)->format('Y-m-d');
            $activityByDate[$date] = ($activityByDate[$date] ?? 0) + 1;
        }

        foreach ($projects as $item) {
            $date = Carbon::parse($item->created_at)->format('Y-m-d');
            $activityByDate[$date] = ($activityByDate[$date] ?? 0) + 1;
        }

        // Generate full daily series for heatmap
        $heatmap = [];
        $totalContributions = array_sum($activityByDate);
        $currentDate = clone $startDate;
        $todayStr = now()->format('Y-m-d');

        while ($currentDate->format('Y-m-d') <= $todayStr) {
            $dStr = $currentDate->format('Y-m-d');
            $count = $activityByDate[$dStr] ?? 0;

            $level = 0;
            if ($count >= 10) {
                $level = 4;
            } elseif ($count >= 6) {
                $level = 3;
            } elseif ($count >= 3) {
                $level = 2;
            } elseif ($count >= 1) {
                $level = 1;
            }

            $heatmap[] = [
                'date' => $dStr,
                'count' => $count,
                'level' => $level,
            ];

            $currentDate->addDay();
        }

        // Calculate active streak and longest streak
        $streaks = $this->calculateStreaks($activityByDate);

        return [
            'total_contributions' => $totalContributions,
            'current_streak' => $streaks['current_streak'],
            'longest_streak' => $streaks['longest_streak'],
            'heatmap' => $heatmap,
        ];
    }

    private function calculateStreaks(array $activityByDate): array
    {
        ksort($activityByDate); // Sort by date ascending

        $dates = array_keys($activityByDate);
        if (empty($dates)) {
            return ['current_streak' => 0, 'longest_streak' => 0];
        }

        $currentStreak = 0;
        $longestStreak = 0;
        $tempStreak = 0;

        $checkDate = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();

        // Check current streak from today or yesterday
        while (isset($activityByDate[$checkDate->format('Y-m-d')]) && $activityByDate[$checkDate->format('Y-m-d')] > 0) {
            $currentStreak++;
            $checkDate->subDay();
        }

        if ($currentStreak === 0 && isset($activityByDate[$yesterday->format('Y-m-d')])) {
            $checkDate = $yesterday;
            while (isset($activityByDate[$checkDate->format('Y-m-d')]) && $activityByDate[$checkDate->format('Y-m-d')] > 0) {
                $currentStreak++;
                $checkDate->subDay();
            }
        }

        // Calculate longest streak across all recorded dates
        $prevDate = null;
        foreach ($dates as $dStr) {
            $cDate = Carbon::parse($dStr);
            if ($prevDate === null || $cDate->diffInDays($prevDate) === 1) {
                $tempStreak++;
            } else {
                $tempStreak = 1;
            }
            if ($tempStreak > $longestStreak) {
                $longestStreak = $tempStreak;
            }
            $prevDate = $cDate;
        }

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => max($longestStreak, $currentStreak),
        ];
    }
}
