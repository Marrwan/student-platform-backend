<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user('sanctum') ?? $request->user();
        $isEnrolled = $user
            ? \App\Models\Enrollment::where('user_id', $user->id)->where('course_id', $this->id)->exists()
            : false;

        $allTopics = $this->relationLoaded('modules')
            ? $this->modules->flatMap(fn ($m) => $m->relationLoaded('topics') ? $m->topics : [])
            : collect();

        $totalTopicsCount = $allTopics->count();
        $completedTopicsCount = 0;

        if ($user && $totalTopicsCount > 0) {
            $topicIds = $allTopics->pluck('id');
            $completedTopicsCount = \App\Models\TopicProgress::query()
                ->where('user_id', $user->id)
                ->whereIn('topic_id', $topicIds)
                ->where('status', \App\Enums\TopicProgressStatus::COMPLETED->value)
                ->count();
        }

        $progressPercentage = $totalTopicsCount > 0
            ? (int) round(($completedTopicsCount / $totalTopicsCount) * 100)
            : 0;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail_url' => $this->thumbnail_url,
            'price' => (float) $this->price,
            'difficulty' => $this->difficulty,
            'is_published' => (bool) $this->is_published,
            'is_enrolled' => $isEnrolled,
            'total_topics_count' => $totalTopicsCount,
            'completed_topics_count' => $completedTopicsCount,
            'progress_percentage' => $progressPercentage,
            'prerequisites' => $this->prerequisites,
            'created_by' => $this->created_by,
            'creator' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'full_name' => $this->creator->full_name,
                'email' => $this->creator->email,
            ]),
            'modules_count' => $this->whenCounted('modules'),
            'modules' => ModuleResource::collection($this->whenLoaded('modules')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
