<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function __construct(
        protected ActivityService $activityService
    ) {}

    /**
     * Get contribution heatmap for authenticated user or specified user.
     */
    public function getHeatmap(Request $request, ?User $user = null): JsonResponse
    {
        $targetUser = $user ?? $request->user();

        if (! $targetUser) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $days = (int) $request->query('days', 365);
        $data = $this->activityService->getUserHeatmap($targetUser, $days);

        return response()->json([
            'user' => [
                'id' => $targetUser->id,
                'full_name' => $targetUser->full_name,
                'avatar' => $targetUser->avatar,
            ],
            'metrics' => $data,
        ]);
    }
}
