<?php

namespace App\Http\Requests\Api\V1\Course;

use App\Enums\CourseDifficulty;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'url', 'max:500'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'difficulty' => ['sometimes', 'string', Rule::enum(CourseDifficulty::class)],
            'is_published' => ['sometimes', 'boolean'],
            'prerequisites' => ['nullable', 'array'],
            'prerequisites.*' => ['uuid', 'exists:courses,id'],
        ];
    }
}
