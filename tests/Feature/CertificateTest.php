<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Module;
use App\Models\Topic;
use App\Models\User;
use App\Services\ProgressionService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_certificate_is_automatically_issued_upon_100_percent_course_completion(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'Laravel Mastery',
            'slug' => 'laravel-mastery',
            'description' => 'Course description',
            'is_published' => true,
            'created_by' => $student->id,
        ]);

        $module = Module::query()->create([
            'course_id' => $course->id,
            'title' => 'Module 1',
            'order_index' => 1,
        ]);

        $topic = Topic::query()->create([
            'module_id' => $module->id,
            'title' => 'Topic 1',
            'slug' => 'topic-1',
            'type' => 'written',
            'order_index' => 1,
        ]);

        $progressionService = app(ProgressionService::class);
        $progressionService->enrollUserInCourse($student, $course);
        $progressionService->completeTopicAndUnlockNext($student, $topic);

        $this->assertDatabaseHas('certificates', [
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_authenticated_user_can_fetch_and_download_their_certificate(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'PHP Advanced',
            'slug' => 'php-advanced',
            'description' => 'Course description',
            'is_published' => true,
            'created_by' => $student->id,
        ]);

        $module = Module::query()->create([
            'course_id' => $course->id,
            'title' => 'Module 1',
            'order_index' => 1,
        ]);

        $topic = Topic::query()->create([
            'module_id' => $module->id,
            'title' => 'Topic 1',
            'slug' => 'topic-1',
            'type' => 'written',
            'order_index' => 1,
        ]);

        $progressionService = app(ProgressionService::class);
        $progressionService->enrollUserInCourse($student, $course);
        $progressionService->completeTopicAndUnlockNext($student, $topic);

        Sanctum::actingAs($student, ['*']);

        $res = $this->getJson('/api/v1/certificates');
        $res->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $certificateUuid = $res->json('data.0.uuid');

        $downloadRes = $this->get("/api/v1/certificates/{$certificateUuid}/download");
        $downloadRes->assertStatus(200);
    }

    public function test_public_user_can_verify_certificate_by_uuid(): void
    {
        $student = User::factory()->create(['first_name' => 'Alice', 'last_name' => 'Smith']);
        $student->assignRole('Student');

        $course = Course::query()->create([
            'title' => 'Mastering Laravel 13',
            'slug' => 'mastering-laravel-13',
            'description' => 'Course description',
            'is_published' => true,
            'created_by' => $student->id,
        ]);

        $module = Module::query()->create([
            'course_id' => $course->id,
            'title' => 'Module 1',
            'order_index' => 1,
        ]);

        $topic = Topic::query()->create([
            'module_id' => $module->id,
            'title' => 'Topic 1',
            'slug' => 'topic-1',
            'type' => 'written',
            'order_index' => 1,
        ]);

        $progressionService = app(ProgressionService::class);
        $progressionService->enrollUserInCourse($student, $course);
        $progressionService->completeTopicAndUnlockNext($student, $topic);

        $certificate = \App\Models\Certificate::first();

        $verifyRes = $this->getJson("/api/v1/certificates/verify/{$certificate->uuid}");
        $verifyRes->assertStatus(200)
            ->assertJsonPath('valid', true)
            ->assertJsonPath('certificate.student_name', 'Alice Smith')
            ->assertJsonPath('certificate.course_title', 'Mastering Laravel 13');
    }
}
