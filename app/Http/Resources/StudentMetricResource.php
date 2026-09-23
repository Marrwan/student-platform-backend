<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'period_type' => $this->period_type,
            'period_identifier' => $this->period_identifier,
            'total_rank_score' => (float) $this->total_rank_score,
            'rank' => (int) $this->rank,
            'score_breakdown' => [
                'accuracy' => (int) $this->accuracy_points,
                'punctuality' => (int) $this->punctuality_points,
                'streak' => (int) $this->streak_points,
                'community' => (int) $this->community_points,
                'project' => (int) $this->project_points,
            ],
            'user' => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'avatar' => $this->user->avatar,
                'streak_count' => (int) $this->user->streak_count,
            ],
            'created_at' => $this->created_at,
        ];
    }
}
