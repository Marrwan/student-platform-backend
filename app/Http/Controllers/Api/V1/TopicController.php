<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Topic\StoreTopicRequest;
use App\Http\Resources\TopicResource;
use App\Models\Topic;
use App\Services\ProgressionService;
use App\Services\TopicService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TopicController extends Controller
{
    public function __construct(
        public TopicService $topicService,
        public ProgressionService $progressionService
    ) {}

    public function store(StoreTopicRequest $request): JsonResponse
    {
        $topic = $this->topicService->createTopic($request->validated());

        return response()->json([
            'message' => 'Topic created successfully.',
            'data' => TopicResource::make($topic),
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, string $topicId): JsonResponse|TopicResource
    {
        $topic = Topic::query()->with([
            'module.course',
            'assessment.testCases',
            'topicProgress' => function ($q) use ($request) {
                if ($request->user()) {
                    $q->where('user_id', $request->user()->id);
                }
            },
        ])->findOrFail($topicId);

        // Check student topic locking / progression access
        if (! $this->progressionService->canUserAccessTopic($request->user(), $topic)) {
            return response()->json([
                'message' => 'This topic is locked. Complete previous topics/assessments first.',
            ], Response::HTTP_FORBIDDEN);
        }

        return TopicResource::make($topic);
    }

    public function update(Request $request, string $topicId): JsonResponse
    {
        $topic = Topic::query()->findOrFail($topicId);
        $updated = $this->topicService->updateTopic($topic, $request->all());

        return response()->json([
            'message' => 'Topic updated successfully.',
            'data' => TopicResource::make($updated),
        ]);
    }

    public function destroy(string $topicId): JsonResponse
    {
        $topic = Topic::query()->findOrFail($topicId);
        $this->topicService->deleteTopic($topic);

        return response()->json([
            'message' => 'Topic deleted successfully.',
        ]);
    }
}
