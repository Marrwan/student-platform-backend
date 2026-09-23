<?php

namespace App\Http\Requests\Api\V1\Project;

use Illuminate\Foundation\Http\FormRequest;

class GradeProjectSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'between:0,100'],
            'status' => ['required', 'string', 'in:accepted,rejected,reviewed'],
            'admin_feedback' => ['nullable', 'string'],
        ];
    }
}
