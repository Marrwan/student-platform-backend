<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentMetric extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'period_type',
        'period_identifier',
        'total_rank_score',
        'accuracy_points',
        'punctuality_points',
        'streak_points',
        'community_points',
        'project_points',
        'rank',
    ];

    protected $casts = [
        'total_rank_score' => 'decimal:2',
        'accuracy_points' => 'integer',
        'punctuality_points' => 'integer',
        'streak_points' => 'integer',
        'community_points' => 'integer',
        'project_points' => 'integer',
        'rank' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
