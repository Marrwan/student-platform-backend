<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'module_id',
        'title',
        'slug',
        'type',
        'content_markdown',
        'video_url',
        'starter_code',
        'solution_code',
        'order_index',
        'estimated_minutes',
        'deadline_hours',
    ];

    protected $casts = [
        'starter_code' => 'array',
        'order_index' => 'integer',
        'estimated_minutes' => 'integer',
        'deadline_hours' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function assessment()
    {
        return $this->morphOne(Assessment::class, 'assessable');
    }

    public function topicProgress()
    {
        return $this->hasMany(TopicProgress::class);
    }

    public function discussionComments()
    {
        return $this->morphMany(DiscussionComment::class, 'commentable');
    }
}
