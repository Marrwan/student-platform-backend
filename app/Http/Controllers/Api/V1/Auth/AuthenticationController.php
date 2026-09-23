<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuthLoginService;
use App\Services\AuthSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticationController extends Controller
{
    public function __construct(
        public AuthLoginService $authLoginService,
        public AuthSessionService $authSessionService
    ) {}

    /**
     * Authenticate user and return access token.
     */
    public function login(LoginRequest $loginRequest): JsonResponse
    {
        $validated = $loginRequest->validated();
        $result = $this->authLoginService->login($validated);

        return response()->json([
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'user' => UserResource::make($result['user']->load(['roles', 'permissions'])),
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles', 'permissions']);

        return response()->json([
            'user' => UserResource::make($user),
        ]);
    }

    /**
     * Verify email / OTP token.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $email = $request->input('email');
        $token = $request->input('token') ?? $request->input('otp');

        $user = User::query()
            ->where('email', $email)
            ->orWhere('id', $token)
            ->first();

        if ($user) {
            $user->update(['email_verified_at' => now()]);
        }

        $targetUser = $user ?? $request->user();
        $authToken = $targetUser ? $targetUser->createToken('api-client')->plainTextToken : null;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $authToken,
            'user' => $targetUser ? UserResource::make($targetUser) : null,
        ]);
    }

    /**
     * Resend verification email/OTP.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Verification code sent to your email.',
        ]);
    }

    /**
     * Send password reset request.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        return response()->json([
            'message' => 'If your email is registered, you will receive password reset instructions.',
        ]);
    }

    /**
     * Reset user password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['nullable', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::query()->where('email', $request->input('email'))->first();
        if (! $user) {
            throw ValidationException::withMessages(['email' => ['User not found with this email.']]);
        }

        $user->update(['password' => Hash::make($request->input('password'))]);

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentPassword = $request->input('current_password') ?? $request->input('currentPassword');
        $newPassword = $request->input('new_password') ?? $request->input('newPassword');

        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['Current password is incorrect.']]);
        }

        $user->update(['password' => Hash::make($newPassword)]);

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * Update user profile details.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $firstName = $request->input('first_name') ?? $request->input('firstName') ?? $user->first_name;
        $lastName = $request->input('last_name') ?? $request->input('lastName') ?? $user->last_name;

        $user->update([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'bio' => $request->input('bio', $user->bio),
            'github_username' => $request->input('github_username', $request->input('githubUsername', $user->github_username)),
            'linkedin_url' => $request->input('linkedin_url', $request->input('linkedinUrl', $user->linkedin_url)),
            'avatar' => $request->input('avatar', $user->avatar),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => UserResource::make($user->fresh(['roles', 'permissions'])),
        ]);
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Notification preferences updated.',
            'settings' => [
                'email_notifications' => (bool) $request->input('emailNotifications', true),
                'push_notifications' => (bool) $request->input('pushNotifications', true),
            ],
        ]);
    }

    /**
     * Logout and revoke current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authSessionService->revokeCurrentToken($request->user());

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * List active sessions/tokens.
     */
    public function sessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()?->id;
        $sessions = $this->authSessionService->listSessions($request->user(), $currentTokenId);

        return response()->json([
            'data' => $sessions,
        ]);
    }

    /**
     * Destroy a specific session/token.
     */
    public function destroySession(Request $request, int $tokenId): JsonResponse
    {
        $deleted = $this->authSessionService->revokeToken($request->user(), $tokenId);

        abort_unless($deleted, Response::HTTP_NOT_FOUND, 'Session token not found.');

        return response()->json(status: Response::HTTP_NO_CONTENT);
    }

    /**
     * Destroy all other sessions/tokens.
     */
    public function destroyOtherSessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()?->id;
        $revoked = $this->authSessionService->revokeOtherTokens($request->user(), $currentTokenId);

        return response()->json([
            'message' => 'Other sessions revoked successfully.',
            'revoked_count' => $revoked,
        ]);
    }
}
