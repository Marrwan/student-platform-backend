<?php

namespace Tests\Feature;

use App\Enums\CourseDifficulty;
use App\Enums\TopicType;
use App\Models\Course;
use App\Models\Module;
use App\Models\Project;
use App\Models\Topic;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiscussionAndProjectShowcaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;
    protected Course $course;
    protected Module $module;
    protected Topic $topic;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Super Admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('Student');

        $this->course = Course::query()->create([
            'title' => 'Vue.js 3 Deep Dive',
            'slug' => 'vuejs-3-deep-dive',
            'description' => 'Build Vue apps.',
            'difficulty' => CourseDifficulty::INTERMEDIATE->value,
            'is_published' => true,
            'created_by' => $this->admin->id,
        ]);

        $this->module = Module::query()->create([
            'course_id' => $this->course->id,
            'title' => 'Module 1: Options API vs Composition API',
            'order_index' => 1,
        ]);

        $this->topic = Topic::query()->create([
            'module_id' => $this->module->id,
            'title' => 'Topic 1: ref() and reactive()',
            'slug' => 'ref-and-reactive',
            'type' => TopicType::WRITTEN->value,
            'order_index' => 1,
        ]);
    }

    public function test_student_can_post_discussion_comment_and_upvote(): void
    {
        // 1. Student posts a comment
        $commentResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/discussions', [
                'commentable_type' => Topic::class,
                'commentable_id' => $this->topic->id,
                'body_markdown' => 'What is the main difference between ref() and reactive() in Vue 3?',
            ]);

        $commentResponse->assertStatus(201);
        $commentId = $commentResponse->json('data.id');

        // 2. Student upvotes comment
        $upvoteResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/v1/discussions/{$commentId}/upvote");

        $upvoteResponse->assertStatus(200)
            ->assertJsonPath('data.upvotes_count', 1);

        // 3. Admin pins comment
        $pinResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/discussions/{$commentId}/pin");

        $pinResponse->assertStatus(200)
            ->assertJsonPath('data.is_pinned', true);
    }

    public function test_student_can_submit_project_and_appear_in_showcase_feed(): void
    {
        // 1. Admin creates Capstone Project
        $projectResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/projects', [
                'course_id' => $this->course->id,
                'title' => 'Vue 3 E-Commerce Storefront',
                'description' => 'Build a responsive store with Pinia state management.',
                'submission_type' => 'frontend_iframe',
            ]);

        $projectResponse->assertStatus(201);
        $projectId = $projectResponse->json('data.id');

        // 2. Student submits live project preview
        $submitResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/projects/submit', [
                'project_id' => $projectId,
                'live_url' => 'https://my-vue-store.netlify.app',
                'preview_html' => '<div id="app"><h1>My Vue Store</h1></div>',
            ]);

        $submitResponse->assertStatus(201);

        // 3. Public showcase feed displays submitted project
        $showcaseResponse = $this->getJson('/api/v1/projects/showcase');

        $showcaseResponse->assertStatus(200)
            ->assertJsonPath('data.0.live_url', 'https://my-vue-store.netlify.app');
    }
}
