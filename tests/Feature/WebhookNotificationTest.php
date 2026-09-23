<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use App\Services\WebhookNotificationService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WebhookNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_webhook_dispatches_http_requests_to_configured_discord_and_slack_urls(): void
    {
        Http::fake();

        config(['services.webhooks.discord' => 'https://discord.com/api/webhooks/test']);
        putenv('DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/test');

        $student = User::factory()->create(['first_name' => 'Bob', 'last_name' => 'Marley']);
        $course = Course::query()->create([
            'title' => 'Vue.js Masterclass',
            'slug' => 'vue-js-masterclass',
            'description' => 'Vue 3 Course',
            'created_by' => $student->id,
        ]);

        $webhookService = app(WebhookNotificationService::class);
        $webhookService->notifyCourseCompleted($student, $course);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'discord.com') &&
                str_contains($request->body(), 'Vue.js Masterclass');
        });
    }
}
