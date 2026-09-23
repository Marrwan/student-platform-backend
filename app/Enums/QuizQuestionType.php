<?php

namespace App\Enums;

enum QuizQuestionType: string
{
    case SINGLE_CHOICE = 'single_choice';
    case MULTIPLE_CHOICE = 'multiple_choice';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
