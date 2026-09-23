<?php

namespace App\Http\Requests\Api\V1\Course;

use App\Enums\CourseDifficulty;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'thumbnail_url' => ['nullable', 'string', 'url', 'max:500'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'difficulty' => ['required', 'string', Rule::enum(CourseDifficulty::class)],
            'is_published' => ['nullable', 'boolean'],
            'prerequisites' => ['nullable', 'array'],
            'prerequisites.*' => ['uuid', 'exists:courses,id'],
        ];
    }
}
