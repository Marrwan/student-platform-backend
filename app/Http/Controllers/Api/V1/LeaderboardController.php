<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentMetricResource;
use App\Models\StudentMetric;
use App\Services\StudentRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeaderboardController extends Controller
{
    public function __construct(
        protected StudentRecognitionService $recognitionService
    ) {}

    /**
     * Get weekly leaderboard.
     */
    public function weekly(Request $request): AnonymousResourceCollection
    {
        $periodIdentifier = $request->query('period') ? (string) $request->query('period') : null;
        $leaderboard = $this->recognitionService->getLeaderboard('weekly', $periodIdentifier);

        return StudentMetricResource::collection($leaderboard);
    }

    /**
     * Get monthly leaderboard.
     */
    public function monthly(Request $request): AnonymousResourceCollection
    {
        $periodIdentifier = $request->query('period') ? (string) $request->query('period') : null;
        $leaderboard = $this->recognitionService->getLeaderboard('monthly', $periodIdentifier);

        return StudentMetricResource::collection($leaderboard);
    }

    /**
     * Get current authenticated user's rank.
     */
    public function myRank(Request $request): JsonResponse
    {
        $user = $request->user();
        $weeklyIdentifier = date('Y-\WW');
        $monthlyIdentifier = date('Y-m');

        $weeklyMetric = StudentMetric::query()
            ->where('user_id', $user->id)
            ->where('period_type', 'weekly')
            ->where('period_identifier', $weeklyIdentifier)
            ->first();

        $monthlyMetric = StudentMetric::query()
            ->where('user_id', $user->id)
            ->where('period_type', 'monthly')
            ->where('period_identifier', $monthlyIdentifier)
            ->first();

        return response()->json([
            'weekly' => $weeklyMetric ? new StudentMetricResource($weeklyMetric) : null,
            'monthly' => $monthlyMetric ? new StudentMetricResource($monthlyMetric) : null,
        ]);
    }
}
