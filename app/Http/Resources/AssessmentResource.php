<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assessable_type' => $this->assessable_type,
            'assessable_id' => $this->assessable_id,
            'title' => $this->title,
            'type' => $this->type,
            'passing_score' => (int) $this->passing_score,
            'time_limit_minutes' => $this->time_limit_minutes ? (int) $this->time_limit_minutes : null,
            'late_fee_amount' => (float) $this->late_fee_amount,
            'test_cases' => TestCaseResource::collection($this->whenLoaded('testCases')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
