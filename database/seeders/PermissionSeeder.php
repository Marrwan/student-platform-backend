<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Foundation\Application;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Permission definitions grouped by module.
     *
     * @var array<string, array<string, array<int, string>>>
     */
    protected array $permissions = [
        'Users' => [
            'user.view' => ['all', 'own'],
            'user.create' => ['all'],
            'user.edit' => ['all', 'own'],
            'user.delete' => ['all'],
            'user.assign_role' => ['all'],
            'user.suspend' => ['all'],
        ],
        'Roles' => [
            'role.view' => ['all'],
            'role.create' => ['all'],
            'role.edit' => ['all'],
            'role.delete' => ['all'],
            'role.edit_permissions' => ['all'],
        ],
        'Courses' => [
            'course.view' => ['all', 'own'],
            'course.create' => ['all'],
            'course.edit' => ['all', 'own'],
            'course.delete' => ['all'],
            'course.publish' => ['all'],
        ],
        'Modules' => [
            'module.view' => ['all', 'own'],
            'module.create' => ['all'],
            'module.edit' => ['all', 'own'],
            'module.delete' => ['all'],
        ],
        'Topics' => [
            'topic.view' => ['all', 'own'],
            'topic.create' => ['all'],
            'topic.edit' => ['all', 'own'],
            'topic.delete' => ['all'],
        ],
        'Assessments' => [
            'assessment.view' => ['all', 'own'],
            'assessment.create' => ['all'],
            'assessment.edit' => ['all', 'own'],
            'assessment.delete' => ['all'],
            'assessment.evaluate' => ['all', 'own'],
        ],
        'Submissions' => [
            'submission.view' => ['all', 'own'],
            'submission.create' => ['own'],
            'submission.grade' => ['all'],
            'submission.delete' => ['all'],
        ],
        'Projects' => [
            'project.view' => ['all', 'own'],
            'project.create' => ['all'],
            'project.edit' => ['all'],
            'project.delete' => ['all'],
            'project_submission.view' => ['all', 'own'],
            'project_submission.create' => ['own'],
            'project_submission.review' => ['all'],
        ],
        'Discussions' => [
            'discussion.view' => ['all', 'own'],
            'discussion.create' => ['own'],
            'discussion.delete' => ['all', 'own'],
            'discussion.pin' => ['all'],
        ],
        'Analytics' => [
            'analytics.view' => ['all'],
            'metrics.calculate' => ['all'],
        ],
    ];

    public function __construct(private readonly Application $application) {}

    public function run(): void
    {
        $this->application->make(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach ($this->permissions as $group => $definitions) {
            foreach ($definitions as $baseName => $scopes) {
                foreach ($scopes as $scope) {
                    $name = sprintf('%s:%s', $baseName, $scope);

                    Permission::query()->firstOrCreate(
                        ['name' => $name, 'guard_name' => 'sanctum'],
                        ['group' => $group]
                    );
                }
            }
        }

        $this->application->make(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
