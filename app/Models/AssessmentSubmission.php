<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssessmentSubmission extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'assessment_id',
        'submitted_code',
        'submitted_answers',
        'score',
        'passed',
        'is_late',
        'late_fee_paid',
        'execution_output',
        'submitted_at',
    ];

    protected $casts = [
        'submitted_answers' => 'array',
        'execution_output' => 'array',
        'score' => 'integer',
        'passed' => 'boolean',
        'is_late' => 'boolean',
        'late_fee_paid' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }
}
