<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProjectShowcaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_student_can_like_and_unlike_a_project_submission(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'React Native',
            'slug' => 'react-native',
            'description' => 'Mobile Dev',
            'created_by' => $student->id,
        ]);

        $project = Project::query()->create([
            'course_id' => $course->id,
            'title' => 'Capstone App',
            'description' => 'Build a mobile app',
        ]);

        $submission = ProjectSubmission::query()->create([
            'project_id' => $project->id,
            'user_id' => $student->id,
            'live_url' => 'https://my-app.vercel.app',
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($student, ['*']);

        // First click -> like
        $res1 = $this->postJson("/api/v1/projects/submissions/{$submission->id}/like");
        $res1->assertStatus(200)
            ->assertJsonPath('liked', true)
            ->assertJsonPath('likes_count', 1);

        // Second click -> unlike
        $res2 = $this->postJson("/api/v1/projects/submissions/{$submission->id}/like");
        $res2->assertStatus(200)
            ->assertJsonPath('liked', false)
            ->assertJsonPath('likes_count', 0);
    }

    public function test_admin_can_feature_project_for_showcase(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'Fullstack SaaS',
            'slug' => 'fullstack-saas',
            'description' => 'SaaS project',
            'created_by' => $admin->id,
        ]);

        $project = Project::query()->create([
            'course_id' => $course->id,
            'title' => 'SaaS Capstone',
            'description' => 'Build a SaaS',
        ]);

        $submission = ProjectSubmission::query()->create([
            'project_id' => $project->id,
            'user_id' => $student->id,
            'live_url' => 'https://awesome-capstone.vercel.app',
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($admin, ['*']);

        $res = $this->postJson("/api/v1/projects/submissions/{$submission->id}/feature");
        $res->assertStatus(200)
            ->assertJsonPath('is_featured', true);

        $this->assertTrue($submission->fresh()->is_featured);
    }

    public function test_public_user_can_view_showcase_feed(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'Next.js 15',
            'slug' => 'next-js-15',
            'description' => 'Next JS',
            'created_by' => $student->id,
        ]);

        $project = Project::query()->create([
            'course_id' => $course->id,
            'title' => 'Gallery Project',
            'description' => 'Showcase gallery',
        ]);

        ProjectSubmission::query()->create([
            'project_id' => $project->id,
            'user_id' => $student->id,
            'live_url' => 'https://showcase-app.com',
            'is_featured' => true,
            'submitted_at' => now(),
        ]);

        $res = $this->getJson('/api/v1/projects/showcase');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'live_url',
                        'likes_count',
                        'is_featured',
                        'user',
                    ],
                ],
            ]);
    }
}
