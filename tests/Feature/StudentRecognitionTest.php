<?php

namespace Tests\Feature;

use App\Models\StudentMetric;
use App\Models\User;
use App\Services\StudentRecognitionService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentRecognitionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_calculates_student_metrics_and_assigns_ranks_accurately(): void
    {
        $student1 = User::factory()->create([
            'total_score' => 200,
            'streak_count' => 5,
        ]);
        $student1->assignRole('Student');

        $student2 = User::factory()->create([
            'total_score' => 500,
            'streak_count' => 10,
        ]);
        $student2->assignRole('Student');

        $service = app(StudentRecognitionService::class);
        $service->calculateMetrics('weekly', '2026-W38');

        $metric1 = StudentMetric::where('user_id', $student1->id)->where('period_identifier', '2026-W38')->first();
        $metric2 = StudentMetric::where('user_id', $student2->id)->where('period_identifier', '2026-W38')->first();

        $this->assertNotNull($metric1);
        $this->assertNotNull($metric2);
        $this->assertEquals(1, $metric2->rank);
        $this->assertEquals(2, $metric1->rank);
        $this->assertGreaterThan($metric1->total_rank_score, $metric2->total_rank_score);
    }

    public function test_artisan_command_metrics_calculate_runs_successfully(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $this->artisan('metrics:calculate-rankings')
            ->assertExitCode(0);

        $this->assertTrue(StudentMetric::where('user_id', $student->id)->exists());
    }

    public function test_student_can_view_weekly_and_monthly_leaderboard_via_api(): void
    {
        $student = User::factory()->create();
        $student->assignRole('Student');

        $service = app(StudentRecognitionService::class);
        $service->calculateMetrics('weekly');
        $service->calculateMetrics('monthly');

        Sanctum::actingAs($student, ['*']);

        $weeklyRes = $this->getJson('/api/v1/leaderboard/weekly');
        $weeklyRes->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'period_type',
                        'period_identifier',
                        'total_rank_score',
                        'rank',
                        'score_breakdown',
                        'user',
                    ],
                ],
            ]);

        $meRes = $this->getJson('/api/v1/leaderboard/me');
        $meRes->assertStatus(200)
            ->assertJsonStructure([
                'weekly',
                'monthly',
            ]);
    }
}
