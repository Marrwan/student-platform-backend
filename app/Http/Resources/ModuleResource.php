<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'description' => $this->description,
            'order_index' => (int) $this->order_index,
            'pass_score_percentage' => (int) $this->pass_score_percentage,
            'deadline_days' => $this->deadline_days ? (int) $this->deadline_days : null,
            'topics_count' => $this->whenCounted('topics'),
            'topics' => TopicResource::collection($this->whenLoaded('topics')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
