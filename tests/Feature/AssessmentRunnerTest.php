<?php

namespace Tests\Feature;

use App\Enums\AssessmentType;
use App\Enums\CourseDifficulty;
use App\Enums\TopicType;
use App\Models\Assessment;
use App\Models\Course;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentRunnerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;
    protected Course $course;
    protected Module $module;
    protected Topic $topic1;
    protected Topic $topic2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('Super Admin');

        $this->student = User::factory()->create();
        $this->student->assignRole('Student');

        // Setup Course structure
        $this->course = Course::query()->create([
            'title' => 'Python Fundamentals',
            'slug' => 'python-fundamentals',
            'description' => 'Learn Python programming.',
            'difficulty' => CourseDifficulty::BEGINNER->value,
            'is_published' => true,
            'created_by' => $this->admin->id,
        ]);

        $this->module = Module::query()->create([
            'course_id' => $this->course->id,
            'title' => 'Module 1: Basics',
            'order_index' => 1,
        ]);

        $this->topic1 = Topic::query()->create([
            'module_id' => $this->module->id,
            'title' => 'Topic 1: Print Statement',
            'slug' => 'topic-1-print',
            'type' => TopicType::CODE_PLAYGROUND->value,
            'order_index' => 1,
        ]);

        $this->topic2 = Topic::query()->create([
            'module_id' => $this->module->id,
            'title' => 'Topic 2: Variables',
            'slug' => 'topic-2-variables',
            'type' => TopicType::CODE_PLAYGROUND->value,
            'order_index' => 2,
        ]);
    }

    public function test_automated_code_evaluation_and_progression_unlocking(): void
    {
        // 1. Admin creates Assessment attached to Topic 1
        $assessmentResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/assessments', [
                'assessable_type' => Topic::class,
                'assessable_id' => $this->topic1->id,
                'title' => 'Print Hello World Exercise',
                'type' => AssessmentType::CODING->value,
                'passing_score' => 70,
            ]);

        $assessmentResponse->assertStatus(201);
        $assessmentId = $assessmentResponse->json('data.id');

        // 2. Admin adds Unit Test Case
        $testCaseResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/assessments/test-cases', [
                'assessment_id' => $assessmentId,
                'description' => 'Prints Hello World',
                'expected_output' => 'Hello World',
                'points' => 25,
            ]);

        $testCaseResponse->assertStatus(201);

        // 3. Student enrolls in Course -> Topic 1 auto-unlocked
        $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/v1/progression/enroll/{$this->course->id}");

        // 4. Student submits INCORRECT code -> fails assessment, Topic 2 stays locked
        $failResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/assessments/submit', [
                'assessment_id' => $assessmentId,
                'submitted_code' => 'print("Goodbye World")',
            ]);

        $failResponse->assertStatus(201)
            ->assertJsonPath('data.passed', false)
            ->assertJsonPath('data.score', 0);

        $topic2Locked = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/v1/topics/{$this->topic2->id}");
        $topic2Locked->assertStatus(403);

        // 5. Student submits CORRECT code -> passes assessment, Topic 2 is auto-unlocked!
        $passResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/assessments/submit', [
                'assessment_id' => $assessmentId,
                'submitted_code' => 'print("Hello World")',
            ]);

        $passResponse->assertStatus(201)
            ->assertJsonPath('data.passed', true)
            ->assertJsonPath('data.score', 100);

        // 6. Verify Topic 2 is now accessible!
        $topic2Unlocked = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/v1/topics/{$this->topic2->id}");
        $topic2Unlocked->assertStatus(200);

        // 7. Verify Student total_score increased by 25 points
        $this->assertEquals(25, $this->student->fresh()->total_score);
    }
}
