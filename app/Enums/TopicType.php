<?php

namespace App\Enums;

enum TopicType: string
{
    case WRITTEN = 'written';
    case VIDEO_EMBED = 'video_embed';
    case VIDEO_LINK = 'video_link';
    case BLOG_LINK = 'blog_link';
    case CODE_PLAYGROUND = 'code_playground';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
