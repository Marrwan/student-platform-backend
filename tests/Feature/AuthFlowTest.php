<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_user_can_verify_email_and_resend_verification(): void
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $resendRes = $this->postJson('/api/v1/auth/resend-verification', [
            'email' => $user->email,
        ]);
        $resendRes->assertStatus(200)
            ->assertJsonPath('message', 'Verification code sent to your email.');

        $verifyRes = $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'otp' => '123456',
        ]);
        $verifyRes->assertStatus(200)
            ->assertJsonPath('message', 'Email verified successfully.');
    }

    public function test_user_can_request_forgot_password_and_reset(): void
    {
        $user = User::factory()->create([
            'email' => 'student@test.com',
            'password' => bcrypt('oldpassword123'),
        ]);

        $forgotRes = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'student@test.com',
        ]);
        $forgotRes->assertStatus(200);

        $resetRes = $this->postJson('/api/v1/auth/reset-password', [
            'email' => 'student@test.com',
            'password' => 'newpassword123',
        ]);
        $resetRes->assertStatus(200);
    }

    public function test_authenticated_user_can_update_profile_and_change_password(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
        ]);
        Sanctum::actingAs($user, ['*']);

        $updateProfileRes = $this->putJson('/api/v1/auth/profile', [
            'firstName' => 'UpdatedFirst',
            'lastName' => 'UpdatedLast',
            'bio' => 'Passionate Software Engineer',
        ]);
        $updateProfileRes->assertStatus(200);

        $this->assertEquals('UpdatedFirst', $user->fresh()->first_name);

        $changePassRes = $this->postJson('/api/v1/auth/change-password', [
            'currentPassword' => 'password123',
            'newPassword' => 'newsecretpass123',
        ]);
        $changePassRes->assertStatus(200);
    }
}
