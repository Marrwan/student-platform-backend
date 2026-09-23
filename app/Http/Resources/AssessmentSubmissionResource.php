<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssessmentSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'assessment_id' => $this->assessment_id,
            'submitted_code' => $this->submitted_code,
            'score' => (int) $this->score,
            'passed' => (bool) $this->passed,
            'is_late' => (bool) $this->is_late,
            'late_fee_paid' => (bool) $this->late_fee_paid,
            'execution_output' => $this->execution_output,
            'submitted_at' => $this->submitted_at,
            'created_at' => $this->created_at,
        ];
    }
}
