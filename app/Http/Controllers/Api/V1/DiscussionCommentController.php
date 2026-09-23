<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Discussion\StoreCommentRequest;
use App\Http\Resources\DiscussionCommentResource;
use App\Models\DiscussionComment;
use App\Services\DiscussionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class DiscussionCommentController extends Controller
{
    public function __construct(
        public DiscussionService $discussionService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $commentableType = $request->query('commentable_type', 'App\Models\Topic');
        $commentableId = $request->route('topicId') ?? $request->query('commentable_id');

        abort_unless($commentableId, Response::HTTP_BAD_REQUEST, 'commentable_id is required.');

        $comments = $this->discussionService->getComments($commentableType, $commentableId);

        return DiscussionCommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request): JsonResponse
    {
        $comment = $this->discussionService->createComment($request->user(), $request->validated());

        return response()->json([
            'message' => 'Comment posted successfully.',
            'data' => DiscussionCommentResource::make($comment),
        ], Response::HTTP_CREATED);
    }

    public function upvote(string $commentId): JsonResponse
    {
        $comment = DiscussionComment::query()->findOrFail($commentId);
        $updated = $this->discussionService->upvoteComment($comment);

        return response()->json([
            'message' => 'Comment upvoted.',
            'data' => DiscussionCommentResource::make($updated),
        ]);
    }

    public function pin(string $commentId): JsonResponse
    {
        $comment = DiscussionComment::query()->findOrFail($commentId);
        $updated = $this->discussionService->togglePinComment($comment);

        return response()->json([
            'message' => $updated->is_pinned ? 'Comment pinned.' : 'Comment unpinned.',
            'data' => DiscussionCommentResource::make($updated),
        ]);
    }
}
