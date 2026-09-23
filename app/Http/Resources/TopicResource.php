<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'module_id' => $this->module_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type,
            'runner_type' => $this->runner_type ?? 'browser_js',
            'sandbox_config' => $this->sandbox_config,
            'content_markdown' => $this->content_markdown,
            'video_url' => $this->video_url,
            'starter_code' => $this->starter_code,
            'order_index' => (int) $this->order_index,
            'estimated_minutes' => (int) $this->estimated_minutes,
            'deadline_hours' => $this->deadline_hours ? (int) $this->deadline_hours : null,
            'assessment' => $this->whenLoaded('assessment', function () {
                return $this->assessment ? [
                    'id' => $this->assessment->id,
                    'title' => $this->assessment->title,
                    'type' => $this->assessment->type,
                    'passing_score' => $this->assessment->passing_score,
                    'test_cases' => $this->assessment->relationLoaded('testCases')
                        ? $this->assessment->testCases->map(fn ($tc) => [
                            'id' => $tc->id,
                            'description' => $tc->description,
                            'input_payload' => $tc->input_payload,
                            'expected_output' => $tc->expected_output,
                            'is_hidden' => (bool) $tc->is_hidden,
                        ]) : [],
                ] : null;
            }),
            'user_progress' => $this->whenLoaded('topicProgress', function () {
                $progress = $this->topicProgress->first();
                return $progress ? [
                    'status' => $progress->status,
                    'completed_at' => $progress->completed_at,
                ] : [
                    'status' => 'locked',
                    'completed_at' => null,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
