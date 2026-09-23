<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthLoginService
{
    /**
     * Authenticate a user and issue a Sanctum token.
     *
     * @param array<string, mixed> $credentials
     * @return array{user: User, token: string}
     */
    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.'],
            ]);
        }

        $user->update([
            'last_active_at' => now(),
        ]);

        $deviceName = $credentials['device_name'] ?? 'api-client';
        $token = $user->createToken($deviceName)->plainTextToken;

        $user->load(['roles', 'permissions']);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
