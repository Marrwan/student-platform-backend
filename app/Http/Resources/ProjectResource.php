<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'description' => $this->description,
            'starter_template_url' => $this->starter_template_url,
            'submission_type' => $this->submission_type,
            'rubrics' => $this->rubrics,
            'created_at' => $this->created_at,
        ];
    }
}
