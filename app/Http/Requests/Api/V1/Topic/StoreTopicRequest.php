<?php

namespace App\Http\Requests\Api\V1\Topic;

use App\Enums\TopicType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTopicRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'module_id' => ['required', 'uuid', 'exists:modules,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::enum(TopicType::class)],
            'content_markdown' => ['nullable', 'string'],
            'video_url' => ['nullable', 'string', 'url', 'max:500'],
            'starter_code' => ['nullable'],
            'solution_code' => ['nullable'],
            'order_index' => ['nullable', 'integer', 'min:1'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1'],
            'deadline_hours' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
