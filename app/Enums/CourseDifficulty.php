<?php

namespace App\Enums;

enum CourseDifficulty: string
{
    case BEGINNER = 'beginner';
    case INTERMEDIATE = 'intermediate';
    case ADVANCED = 'advanced';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
