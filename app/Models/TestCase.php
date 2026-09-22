<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestCase extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'assessment_id',
        'description',
        'input_payload',
        'expected_output',
        'is_hidden',
        'points',
    ];

    protected $casts = [
        'is_hidden' => 'boolean',
        'points' => 'integer',
    ];

    public function assessment()
    {
        return $this->belongsTo(Assessment::class);
    }
}
