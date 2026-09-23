<?php

namespace App\Http\Requests\Api\V1\Module;

use Illuminate\Foundation\Http\FormRequest;

class StoreModuleRequest extends FormRequest
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
            'description' => ['nullable', 'string'],
            'order_index' => ['nullable', 'integer', 'min:1'],
            'pass_score_percentage' => ['nullable', 'integer', 'between:1,100'],
            'deadline_days' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
