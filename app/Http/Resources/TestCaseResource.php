<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assessment_id' => $this->assessment_id,
            'description' => $this->description,
            'input_payload' => $this->input_payload,
            'expected_output' => $this->expected_output,
            'is_hidden' => (bool) $this->is_hidden,
            'points' => (int) $this->points,
        ];
    }
}
