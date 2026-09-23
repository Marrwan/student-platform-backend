<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\DiscussionComment;
use App\Models\Module;
use App\Models\Topic;
use App\Models\TopicProgress;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityHeatmapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_aggregates_user_activity_heatmap_and_streak(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'Vue Course',
            'slug' => 'vue-course',
            'description' => 'Vue JS',
            'created_by' => $student->id,
        ]);

        $module = Module::query()->create([
            'course_id' => $course->id,
            'title' => 'Mod 1',
            'order_index' => 1,
        ]);

        $topic = Topic::query()->create([
            'module_id' => $module->id,
            'title' => 'Topic 1',
            'slug' => 'topic-1',
            'type' => 'written',
            'order_index' => 1,
        ]);

        TopicProgress::query()->create([
            'user_id' => $student->id,
            'topic_id' => $topic->id,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        DiscussionComment::query()->create([
            'commentable_type' => Topic::class,
            'commentable_id' => $topic->id,
            'user_id' => $student->id,
            'body_markdown' => 'Great lesson!',
            'created_at' => now(),
        ]);

        Sanctum::actingAs($student, ['*']);

        $response = $this->getJson('/api/v1/auth/activity-heatmap');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'full_name'],
                'metrics' => [
                    'total_contributions',
                    'current_streak',
                    'longest_streak',
                    'heatmap' => [
                        '*' => ['date', 'count', 'level'],
                    ],
                ],
            ]);

        $this->assertEquals(2, $response->json('metrics.total_contributions'));
    }
}
