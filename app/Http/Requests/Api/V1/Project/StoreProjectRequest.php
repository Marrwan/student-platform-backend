<?php

namespace App\Http\Requests\Api\V1\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['required', 'uuid', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'starter_template_url' => ['nullable', 'string', 'url', 'max:500'],
            'submission_type' => ['nullable', 'string', 'in:frontend_iframe,github,zip,all'],
            'rubrics' => ['nullable', 'array'],
        ];
    }
}
