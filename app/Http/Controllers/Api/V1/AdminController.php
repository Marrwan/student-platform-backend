<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\AssessmentSubmission;
use App\Models\Course;
use App\Models\ProjectSubmission;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminController extends Controller
{
    /**
     * Get Admin Dashboard overview metrics.
     */
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalCourses = Course::count();
        $totalTopics = Topic::count();
        $totalSubmissions = AssessmentSubmission::count() + ProjectSubmission::count();
        $activeUsers = User::whereNotNull('email_verified_at')->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'suspended_users' => $totalUsers - $activeUsers,
                'total_courses' => $totalCourses,
                'total_topics' => $totalTopics,
                'total_submissions' => $totalSubmissions,
                'active_roles' => Role::count(),
            ],
        ]);
    }

    /**
     * Get paginated User Directory with search and filters.
     */
    public function users(Request $request): JsonResponse
    {
        $query = User::with(['roles', 'permissions'])->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->whereHas('roles', function ($q) use ($role): void {
                $q->where('name', $role);
            });
        }

        $users = $query->paginate($request->integer('limit', 15));

        return response()->json([
            'users' => UserResource::collection($users),
            'total' => $users->total(),
            'page' => $users->currentPage(),
            'totalPages' => $users->lastPage(),
            'metrics' => [
                'total_users' => User::count(),
                'active_users' => User::whereNotNull('email_verified_at')->count(),
                'suspended_users' => User::whereNull('email_verified_at')->count(),
                'active_roles' => Role::count(),
            ],
        ]);
    }

    /**
     * Create a new user.
     */
    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        if (! empty($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        } else {
            $user->assignRole('Student');
        }

        return response()->json([
            'message' => 'User created successfully.',
            'user' => UserResource::make($user->load(['roles', 'permissions'])),
        ], Response::HTTP_CREATED);
    }

    /**
     * Update user roles.
     */
    public function updateUserRole(Request $request, string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        $validated = $request->validate([
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string'],
            'role' => ['nullable', 'string'],
        ]);

        $rolesToSync = [];
        if (! empty($validated['roles'])) {
            $rolesToSync = $validated['roles'];
        } elseif (! empty($validated['role'])) {
            $rolesToSync = [$validated['role']];
        }

        if (! empty($rolesToSync)) {
            // Ensure roles exist in DB or create them
            foreach ($rolesToSync as $roleName) {
                Role::firstOrCreate(['name' => ucfirst($roleName), 'guard_name' => 'sanctum']);
            }
            $user->syncRoles(array_map('ucfirst', $rolesToSync));
        }

        return response()->json([
            'message' => 'User roles updated successfully.',
            'user' => UserResource::make($user->fresh(['roles', 'permissions'])),
        ]);
    }

    /**
     * Toggle user activation status.
     */
    public function toggleUserStatus(Request $request, string $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $user->email_verified_at = $user->email_verified_at ? null : now();
        $user->save();

        return response()->json([
            'message' => 'User status updated successfully.',
            'user' => UserResource::make($user->fresh(['roles', 'permissions'])),
        ]);
    }

    /**
     * Get Roles & Permissions Matrix.
     */
    public function roles(): JsonResponse
    {
        $rolesTable = config('permission.table_names.roles', 'roles');
        $modelHasRolesTable = config('permission.table_names.model_has_roles', 'model_has_roles');

        $roles = Role::with(['permissions'])->get()->map(function ($role) use ($modelHasRolesTable) {
            $scope = 'All';
            if (in_array(strtolower($role->name), ['student'])) {
                $scope = 'Own';
            } elseif (in_array(strtolower($role->name), ['instructor', 'staff', 'unit supervisor'])) {
                $scope = 'Department';
            }

            $usersCount = \Illuminate\Support\Facades\DB::table($modelHasRolesTable)
                ->where('role_id', $role->id)
                ->count();

            return [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->name . ' role with granular access capabilities.',
                'users_count' => $usersCount,
                'permissions_count' => $role->permissions->count(),
                'access_scope' => $scope,
                'is_system' => in_array($role->name, ['Admin', 'Super Admin', 'Student', 'Instructor']),
                'permissions' => $role->permissions->pluck('name'),
                'created_at' => $role->created_at?->format('d M Y') ?? '10 Jan 2026',
            ];
        });

        $allPermissions = Permission::where('guard_name', 'sanctum')->pluck('name');
        $totalUsersWithRoles = \Illuminate\Support\Facades\DB::table($modelHasRolesTable)
            ->distinct('model_id')
            ->count('model_id');

        return response()->json([
            'roles' => $roles,
            'permissions' => $allPermissions,
            'metrics' => [
                'total_roles' => $roles->count(),
                'users_with_roles' => $totalUsersWithRoles,
                'avg_permissions' => (int) round($roles->avg('permissions_count') ?: 0),
                'system_roles' => $roles->where('is_system', true)->count(),
            ],
        ]);
    }

    /**
     * Store new custom role.
     */
    public function storeRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $role = Role::create([
            'name' => ucfirst($validated['name']),
            'guard_name' => 'sanctum',
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role created successfully.',
            'role' => $role->load('permissions'),
        ], Response::HTTP_CREATED);
    }

    /**
     * Get Assessment and Capstone Submissions queue.
     */
    public function submissions(Request $request): JsonResponse
    {
        $assessmentSubmissions = AssessmentSubmission::with(['user', 'assessment'])->latest()->paginate($request->integer('limit', 15));

        return response()->json([
            'submissions' => $assessmentSubmissions->items(),
            'total' => $assessmentSubmissions->total(),
            'page' => $assessmentSubmissions->currentPage(),
            'totalPages' => $assessmentSubmissions->lastPage(),
        ]);
    }

    /**
     * Grade an Assessment Submission.
     */
    public function gradeSubmission(Request $request, string $submissionId): JsonResponse
    {
        $submission = AssessmentSubmission::findOrFail($submissionId);

        $validated = $request->validate([
            'score' => ['required', 'integer', 'min:0', 'max:100'],
            'feedback' => ['nullable', 'string'],
        ]);

        $submission->update([
            'score' => $validated['score'],
            'feedback' => $validated['feedback'] ?? null,
            'is_passed' => $validated['score'] >= 70,
        ]);

        return response()->json([
            'message' => 'Submission graded successfully.',
            'submission' => $submission,
        ]);
    }
}
