<?php

namespace App\Http\Requests\Api\V1\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class SubmitAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_id' => ['required', 'uuid', 'exists:assessments,id'],
            'submitted_code' => ['nullable', 'string'],
            'submitted_answers' => ['nullable', 'array'],
        ];
    }
}
