<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function __construct(private readonly Application $application) {}

    public function run(): void
    {
        $this->application->make(PermissionRegistrar::class)->forgetCachedPermissions();

        // Admin Role
        $adminRole = Role::query()->firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'sanctum',
        ]);

        $adminRole->syncPermissions(
            Permission::query()->where('guard_name', 'sanctum')->pluck('name')->all()
        );

        // Super Admin Role
        $superAdminRole = Role::query()->firstOrCreate([
            'name' => 'Super Admin',
            'guard_name' => 'sanctum',
        ]);

        $superAdminRole->syncPermissions(
            Permission::query()->where('guard_name', 'sanctum')->pluck('name')->all()
        );

        // Instructor Role
        $instructorRole = Role::query()->firstOrCreate([
            'name' => 'Instructor',
            'guard_name' => 'sanctum',
        ]);

        $instructorRole->syncPermissions(
            Permission::query()->where('guard_name', 'sanctum')
                ->where(function ($query): void {
                    $query->where('name', 'like', 'course.%')
                        ->orWhere('name', 'like', 'module.%')
                        ->orWhere('name', 'like', 'topic.%')
                        ->orWhere('name', 'like', 'assessment.%')
                        ->orWhere('name', 'like', 'project.%')
                        ->orWhereIn('name', [
                            'submission.view:all',
                            'submission.grade:all',
                            'project_submission.view:all',
                            'project_submission.review:all',
                            'discussion.view:all',
                            'discussion.create:own',
                            'discussion.pin:all',
                            'analytics.view:all',
                        ]);
                })
                ->pluck('name')
                ->all()
        );

        // Student Role
        $studentRole = Role::query()->firstOrCreate([
            'name' => 'Student',
            'guard_name' => 'sanctum',
        ]);

        $studentRole->syncPermissions(
            Permission::query()->where('guard_name', 'sanctum')
                ->whereIn('name', [
                    'user.view:own',
                    'user.edit:own',
                    'course.view:all',
                    'course.view:own',
                    'module.view:all',
                    'module.view:own',
                    'topic.view:all',
                    'topic.view:own',
                    'assessment.view:all',
                    'assessment.view:own',
                    'assessment.evaluate:own',
                    'submission.view:own',
                    'submission.create:own',
                    'project.view:all',
                    'project.view:own',
                    'project_submission.view:own',
                    'project_submission.create:own',
                    'discussion.view:all',
                    'discussion.create:own',
                ])
                ->pluck('name')
                ->all()
        );

        // Create Default Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@strangedev.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        $admin->syncRoles([$adminRole, $superAdminRole]);

        $this->application->make(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
