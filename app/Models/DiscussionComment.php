<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionComment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'commentable_type',
        'commentable_id',
        'user_id',
        'parent_id',
        'body_markdown',
        'is_pinned',
        'upvotes_count',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'upvotes_count' => 'integer',
    ];

    public function commentable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(DiscussionComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(DiscussionComment::class, 'parent_id');
    }
}
