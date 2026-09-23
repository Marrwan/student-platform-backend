<?php

namespace App\Http\Requests\Api\V1\Assessment;

use App\Enums\AssessmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessable_type' => ['required', 'string', 'in:App\Models\Topic,App\Models\Module'],
            'assessable_id' => ['required', 'uuid'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::enum(AssessmentType::class)],
            'passing_score' => ['nullable', 'integer', 'between:1,100'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1'],
            'late_fee_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
