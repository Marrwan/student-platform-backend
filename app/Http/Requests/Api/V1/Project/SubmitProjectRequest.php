<?php

namespace App\Http\Requests\Api\V1\Project;

use Illuminate\Foundation\Http\FormRequest;

class SubmitProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'uuid', 'exists:projects,id'],
            'live_url' => ['nullable', 'string', 'url', 'max:500'],
            'github_url' => ['nullable', 'string', 'url', 'max:500'],
            'preview_html' => ['nullable', 'string'],
        ];
    }
}
