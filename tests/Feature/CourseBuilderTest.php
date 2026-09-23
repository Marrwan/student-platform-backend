<?php

namespace Tests\Feature;

use App\Enums\CourseDifficulty;
use App\Enums\TopicType;
use App\Models\Course;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseBuilderTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Super Admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('Student');
    }

    public function test_admin_can_create_course_module_and_topics(): void
    {
        // 1. Admin creates a Course
        $courseResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/courses', [
                'title' => 'Master JavaScript Fundamentals',
                'description' => 'Comprehensive JS course from zero to hero.',
                'difficulty' => CourseDifficulty::BEGINNER->value,
                'is_published' => true,
            ]);

        $courseResponse->assertStatus(201);
        $courseId = $courseResponse->json('data.id');

        // 2. Admin creates a Module
        $moduleResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/modules', [
                'course_id' => $courseId,
                'title' => 'Module 1: Variables & Data Types',
                'order_index' => 1,
            ]);

        $moduleResponse->assertStatus(201);
        $moduleId = $moduleResponse->json('data.id');

        // 3. Admin creates Topic 1 & Topic 2
        $topic1Response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/topics', [
                'module_id' => $moduleId,
                'title' => 'Topic 1: Declaring Variables with let & const',
                'type' => TopicType::WRITTEN->value,
                'order_index' => 1,
            ]);

        $topic1Response->assertStatus(201);
        $topic1Id = $topic1Response->json('data.id');

        $topic2Response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/topics', [
                'module_id' => $moduleId,
                'title' => 'Topic 2: Primitive Data Types',
                'type' => TopicType::CODE_PLAYGROUND->value,
                'order_index' => 2,
            ]);

        $topic2Response->assertStatus(201);
        $topic2Id = $topic2Response->json('data.id');

        // 4. Student enrolls in Course -> Topic 1 is auto-unlocked
        $enrollResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/v1/progression/enroll/{$courseId}");

        $enrollResponse->assertStatus(201);

        // 5. Student can access Topic 1, but Topic 2 is locked
        $accessTopic1 = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/v1/topics/{$topic1Id}");
        $accessTopic1->assertStatus(200);

        $accessTopic2 = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/v1/topics/{$topic2Id}");
        $accessTopic2->assertStatus(403); // Forbidden because locked!

        // 6. Student completes Topic 1 -> Topic 2 is auto-unlocked!
        $completeResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/v1/progression/topics/{$topic1Id}/complete");

        $completeResponse->assertStatus(200);

        // 7. Now Student can access Topic 2!
        $accessTopic2Now = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/v1/topics/{$topic2Id}");
        $accessTopic2Now->assertStatus(200);
    }
}
