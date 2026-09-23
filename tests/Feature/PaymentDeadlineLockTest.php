<?php

namespace Tests\Feature;

use App\Enums\AssessmentType;
use App\Enums\CourseDifficulty;
use App\Enums\PaymentStatus;
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

class PaymentDeadlineLockTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;
    protected Course $course;
    protected Module $module;
    protected Topic $topic;
    protected Assessment $assessment;

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
            'title' => 'Advanced React',
            'slug' => 'advanced-react',
            'description' => 'Deep dive into React.',
            'difficulty' => CourseDifficulty::ADVANCED->value,
            'is_published' => true,
            'created_by' => $this->admin->id,
        ]);

        $this->module = Module::query()->create([
            'course_id' => $this->course->id,
            'title' => 'Module 1: Custom Hooks',
            'order_index' => 1,
        ]);

        $this->topic = Topic::query()->create([
            'module_id' => $this->module->id,
            'title' => 'Topic 1: useMemo & useCallback',
            'slug' => 'usememo-usecallback',
            'type' => TopicType::CODE_PLAYGROUND->value,
            'order_index' => 1,
            'deadline_hours' => 2,
        ]);

        $this->assessment = Assessment::query()->create([
            'assessable_type' => Topic::class,
            'assessable_id' => $this->topic->id,
            'title' => 'React Performance Exercise',
            'type' => AssessmentType::CODING->value,
            'passing_score' => 70,
            'late_fee_amount' => 1000.00,
        ]);
    }

    public function test_student_can_initialize_and_verify_late_fee_payment(): void
    {
        // 1. Student initializes late fee payment
        $initResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/payments/initialize-late-fee', [
                'assessment_id' => $this->assessment->id,
            ]);

        $initResponse->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'authorization_url',
                    'reference',
                    'payment' => ['id', 'amount', 'status'],
                ],
            ]);

        $reference = $initResponse->json('data.reference');
        $this->assertDatabaseHas('payments', [
            'reference' => $reference,
            'amount' => 1000.00,
            'status' => PaymentStatus::PENDING->value,
        ]);

        // 2. Student verifies payment reference
        $verifyResponse = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/v1/payments/verify', [
                'reference' => $reference,
            ]);

        $verifyResponse->assertStatus(200)
            ->assertJsonPath('data.status', PaymentStatus::SUCCESS->value);

        // 3. Verify late_fee_paid is set to true in assessment_submissions
        $this->assertDatabaseHas('assessment_submissions', [
            'user_id' => $this->student->id,
            'assessment_id' => $this->assessment->id,
            'late_fee_paid' => true,
        ]);
    }
}
