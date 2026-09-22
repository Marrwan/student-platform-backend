<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'assessable_type',
        'assessable_id',
        'title',
        'type',
        'passing_score',
        'time_limit_minutes',
        'late_fee_amount',
    ];

    protected $casts = [
        'passing_score' => 'integer',
        'time_limit_minutes' => 'integer',
        'late_fee_amount' => 'decimal:2',
    ];

    public function assessable()
    {
        return $this->morphTo();
    }

    public function testCases()
    {
        return $this->hasMany(TestCase::class);
    }

    public function quizQuestions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function submissions()
    {
        return $this->hasMany(AssessmentSubmission::class);
    }
}
