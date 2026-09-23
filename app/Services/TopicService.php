<?php

namespace App\Services;

use App\Enums\AssessmentType;
use App\Models\Topic;
use Illuminate\Support\Str;

class TopicService
{
    /**
     * Create a new topic within a module.
     */
    public function createTopic(array $data): Topic
    {
        if (empty($data['order_index'])) {
            $maxOrder = Topic::query()->where('module_id', $data['module_id'])->max('order_index') ?? 0;
            $data['order_index'] = $maxOrder + 1;
        }

        $slug = Str::slug($data['title']);

        $starterCode = $data['starter_code'] ?? null;
        if (is_string($starterCode)) {
            $starterCode = ['code' => $starterCode, 'js' => $starterCode];
        }

        $videoUrl = $this->normalizeVideoUrl($data['video_url'] ?? null);

        $topic = Topic::query()->create([
            'module_id' => $data['module_id'],
            'title' => $data['title'],
            'slug' => $slug,
            'type' => $data['type'],
            'runner_type' => $data['runner_type'] ?? 'browser_js',
            'content_markdown' => $data['content_markdown'] ?? null,
            'video_url' => $videoUrl,
            'starter_code' => $starterCode,
            'solution_code' => $data['solution_code'] ?? null,
            'order_index' => $data['order_index'],
            'estimated_minutes' => $data['estimated_minutes'] ?? 15,
            'deadline_hours' => $data['deadline_hours'] ?? null,
        ]);

        if (isset($data['test_cases']) && is_array($data['test_cases'])) {
            $assessment = $topic->assessment()->create([
                'title' => $topic->title . ' Assessment',
                'type' => \App\Enums\AssessmentType::CODING->value,
                'passing_score' => 80,
            ]);
            foreach ($data['test_cases'] as $idx => $tc) {
                if (!empty($tc['description']) || !empty($tc['expected_output'])) {
                    $assessment->testCases()->create([
                        'description' => $tc['description'] ?? 'Test case ' . ($idx + 1),
                        'input_payload' => $tc['input_payload'] ?? null,
                        'expected_output' => $tc['expected_output'] ?? '',
                        'is_hidden' => !empty($tc['is_hidden']),
                        'points' => $tc['points'] ?? 10,
                    ]);
                }
            }
        }

        return $topic;
    }

    /**
     * Update an existing topic.
     */
    public function updateTopic(Topic $topic, array $data): Topic
    {
        if (isset($data['title']) && $data['title'] !== $topic->title) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (isset($data['starter_code']) && is_string($data['starter_code'])) {
            $data['starter_code'] = ['code' => $data['starter_code'], 'js' => $data['starter_code']];
        }

        if (isset($data['video_url'])) {
            $data['video_url'] = $this->normalizeVideoUrl($data['video_url']);
        }

        $testCases = $data['test_cases'] ?? null;
        unset($data['test_cases']);

        $topic->update($data);

        if ($testCases !== null && is_array($testCases)) {
            $assessment = $topic->assessment()->firstOrCreate(
                ['assessable_type' => Topic::class, 'assessable_id' => $topic->id],
                [
                    'title' => $topic->title . ' Assessment',
                    'type' => \App\Enums\AssessmentType::CODING->value,
                    'passing_score' => 80,
                ]
            );

            $assessment->testCases()->delete();
            foreach ($testCases as $idx => $tc) {
                if (!empty($tc['description']) || !empty($tc['expected_output'])) {
                    $assessment->testCases()->create([
                        'description' => $tc['description'] ?? 'Test case ' . ($idx + 1),
                        'input_payload' => $tc['input_payload'] ?? null,
                        'expected_output' => $tc['expected_output'] ?? '',
                        'is_hidden' => !empty($tc['is_hidden']),
                        'points' => $tc['points'] ?? 10,
                    ]);
                }
            }
        }

        return $topic->fresh(['assessment.testCases']);
    }

    /**
     * Delete a topic.
     */
    public function deleteTopic(Topic $topic): bool
    {
        return (bool) $topic->delete();
    }

    /**
     * Transform regular video URLs (YouTube watch / Vimeo / Shorts) to embed URLs.
     */
    private function normalizeVideoUrl(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);

        // YouTube standard watch or youtu.be
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i', $url, $matches)) {
            return "https://www.youtube-nocookie.com/embed/{$matches[1]}";
        }

        // YouTube shorts
        if (preg_match('/youtube\.com\/shorts\/([^"&?\/\s]{11})/i', $url, $matches)) {
            return "https://www.youtube-nocookie.com/embed/{$matches[1]}";
        }

        // Vimeo
        if (preg_match('/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i', $url, $matches)) {
            return "https://player.vimeo.com/video/{$matches[1]}";
        }

        return $url;
    }
}
