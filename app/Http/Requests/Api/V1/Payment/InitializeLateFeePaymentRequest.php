<?php

namespace App\Http\Requests\Api\V1\Payment;

use Illuminate\Foundation\Http\FormRequest;

class InitializeLateFeePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_id' => ['required', 'uuid', 'exists:assessments,id'],
            'callback_url' => ['nullable', 'string', 'url'],
        ];
    }
}
