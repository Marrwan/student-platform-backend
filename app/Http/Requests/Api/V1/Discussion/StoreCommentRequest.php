<?php

namespace App\Http\Requests\Api\V1\Discussion;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->route('topicId')) {
            $this->merge([
                'commentable_type' => 'App\Models\Topic',
                'commentable_id' => $this->route('topicId'),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'commentable_type' => ['required', 'string', 'in:App\Models\Topic,App\Models\Project'],
            'commentable_id' => ['required', 'uuid'],
            'parent_id' => ['nullable', 'uuid', 'exists:discussion_comments,id'],
            'body_markdown' => ['required', 'string', 'max:5000'],
        ];
    }
}
