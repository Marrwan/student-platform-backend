<?php

namespace App\Services;

use App\Models\Course;
use App\Models\ProjectSubmission;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookNotificationService
{
    /**
     * Notify community on course completion.
     */
    public function notifyCourseCompleted(User $user, Course $course): void
    {
        $message = "🎓 **Course Completed!**\n**{$user->full_name}** has completed the course **{$course->title}**!";
        
        $this->dispatchDiscord([
            'embeds' => [[
                'title' => '🎉 Student Graduation',
                'description' => $message,
                'color' => 65280, // Green
                'fields' => [
                    ['name' => 'Student', 'value' => $user->full_name, 'inline' => true],
                    ['name' => 'Course', 'value' => $course->title, 'inline' => true],
                ],
                'timestamp' => now()->toIso8601String(),
            ]],
        ]);

        $this->dispatchSlack([
            'text' => $message,
        ]);
    }

    /**
     * Notify community on top student ranking.
     */
    public function notifyTopStudent(User $user, string $period, int $rank): void
    {
        if ($rank !== 1) {
            return;
        }

        $title = ucfirst($period) . " Student of the Period!";
        $message = "👑 **{$user->full_name}** has taken 1st Place on the {$period} Leaderboard!";

        $this->dispatchDiscord([
            'embeds' => [[
                'title' => '🏆 ' . $title,
                'description' => $message,
                'color' => 16766720, // Gold
                'timestamp' => now()->toIso8601String(),
            ]],
        ]);

        $this->dispatchSlack([
            'text' => $message,
        ]);
    }

    /**
     * Notify community when a project is featured.
     */
    public function notifyProjectFeatured(ProjectSubmission $submission): void
    {
        $submission->load(['user', 'project']);
        $message = "🌟 **Featured Project Showcase!**\nCheck out **{$submission->user->full_name}**'s submission for **{$submission->project->title}**!";

        $this->dispatchDiscord([
            'embeds' => [[
                'title' => '🚀 Featured Student Project',
                'description' => $message,
                'color' => 65471, // Cyan
                'fields' => [
                    ['name' => 'Live Demo', 'value' => $submission->live_url ?? 'N/A', 'inline' => true],
                    ['name' => 'GitHub Code', 'value' => $submission->github_url ?? 'N/A', 'inline' => true],
                ],
                'timestamp' => now()->toIso8601String(),
            ]],
        ]);

        $this->dispatchSlack([
            'text' => $message,
        ]);
    }

    private function dispatchDiscord(array $payload): void
    {
        $url = env('DISCORD_WEBHOOK_URL');
        if (! $url) {
            return;
        }

        try {
            Http::post($url, $payload);
        } catch (\Throwable $e) {
            Log::error("Discord Webhook Failed: " . $e->getMessage());
        }
    }

    private function dispatchSlack(array $payload): void
    {
        $url = env('SLACK_WEBHOOK_URL');
        if (! $url) {
            return;
        }

        try {
            Http::post($url, $payload);
        } catch (\Throwable $e) {
            Log::error("Slack Webhook Failed: " . $e->getMessage());
        }
    }
}
