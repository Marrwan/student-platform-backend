<?php

namespace App\Enums;

enum AssessmentType: string
{
    case QUIZ = 'quiz';
    case CODING = 'coding';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
