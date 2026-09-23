<?php

namespace App\Services;

use App\Models\DiscussionComment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DiscussionService
{
    /**
     * List discussion comments for a Topic or Project (with nested replies & user details).
     */
    public function getComments(string $commentableType, string $commentableId, int $perPage = 20): LengthAwarePaginator
    {
        return DiscussionComment::query()
            ->with(['user', 'replies.user'])
            ->where('commentable_type', $commentableType)
            ->where('commentable_id', $commentableId)
            ->whereNull('parent_id') // Top level comments only
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Post a comment or reply.
     */
    public function createComment(User $user, array $data): DiscussionComment
    {
        $comment = DiscussionComment::query()->create([
            'commentable_type' => $data['commentable_type'],
            'commentable_id' => $data['commentable_id'],
            'user_id' => $user->id,
            'parent_id' => $data['parent_id'] ?? null,
            'body_markdown' => $data['body_markdown'],
        ]);

        return $comment->load('user');
    }

    /**
     * Upvote a comment.
     */
    public function upvoteComment(DiscussionComment $comment): DiscussionComment
    {
        $comment->increment('upvotes_count');

        return $comment->fresh();
    }

    /**
     * Pin a comment as instructor answer.
     */
    public function togglePinComment(DiscussionComment $comment): DiscussionComment
    {
        $comment->update(['is_pinned' => ! $comment->is_pinned]);

        return $comment->fresh();
    }
}
