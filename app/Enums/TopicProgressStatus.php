<?php

namespace App\Enums;

enum TopicProgressStatus: string
{
    case LOCKED = 'locked';
    case UNLOCKED = 'unlocked';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
