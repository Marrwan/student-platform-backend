<?php

namespace App\Services;

use App\Models\User;

class AuthSessionService
{
    /**
     * List active access token sessions for the user.
     */
    public function listSessions(User $user, ?int $currentTokenId = null): array
    {
        return $user->tokens->map(function ($token) use ($currentTokenId) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
                'is_current' => $token->id === $currentTokenId,
            ];
        })->toArray();
    }

    /**
     * Revoke the current token.
     */
    public function revokeCurrentToken(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    /**
     * Revoke a specific token.
     */
    public function revokeToken(User $user, int $tokenId): bool
    {
        $token = $user->tokens()->where('id', $tokenId)->first();
        if ($token) {
            $token->delete();
            return true;
        }

        return false;
    }

    /**
     * Revoke all other tokens except the current token.
     */
    public function revokeOtherTokens(User $user, ?int $currentTokenId = null): int
    {
        if (! $currentTokenId) {
            return 0;
        }

        return $user->tokens()->where('id', '!=', $currentTokenId)->delete();
    }
}
