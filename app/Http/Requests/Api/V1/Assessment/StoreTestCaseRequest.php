<?php

namespace App\Http\Requests\Api\V1\Assessment;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_id' => ['required', 'uuid', 'exists:assessments,id'],
            'description' => ['required', 'string', 'max:255'],
            'input_payload' => ['nullable', 'string'],
            'expected_output' => ['required', 'string'],
            'is_hidden' => ['nullable', 'boolean'],
            'points' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
