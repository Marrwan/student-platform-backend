<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AuthRegisterService
{
    /**
     * Register a new user, assign default Student role, and issue a Sanctum token.
     *
     * @param array<string, mixed> $data
     * @return array{user: User, token: string}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'github_username' => $data['github_username'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'last_active_at' => now(),
        ]);

        // Assign default Student role
        $studentRole = Role::findByName('Student', 'sanctum');
        if ($studentRole) {
            $user->assignRole($studentRole);
        }

        $token = $user->createToken('api-client')->plainTextToken;
        $user->load(['roles', 'permissions']);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
