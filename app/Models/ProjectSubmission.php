<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectSubmission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'project_id',
        'user_id',
        'live_url',
        'github_url',
        'preview_html',
        'score',
        'likes_count',
        'is_featured',
        'status',
        'admin_feedback',
        'reviewed_by',
        'submitted_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'likes_count' => 'integer',
        'is_featured' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ProjectSubmissionLike::class, 'project_submission_id');
    }
}
