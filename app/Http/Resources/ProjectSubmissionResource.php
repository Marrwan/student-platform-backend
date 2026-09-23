<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'user_id' => $this->user_id,
            'live_url' => $this->live_url,
            'github_url' => $this->github_url,
            'preview_html' => $this->preview_html,
            'score' => (int) $this->score,
            'likes_count' => (int) $this->likes_count,
            'is_featured' => (bool) $this->is_featured,
            'status' => $this->status,
            'admin_feedback' => $this->admin_feedback,
            'reviewed_by' => $this->reviewed_by,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'avatar' => $this->user->avatar,
            ]),
            'project' => ProjectResource::make($this->whenLoaded('project')),
            'submitted_at' => $this->submitted_at,
        ];
    }
}
