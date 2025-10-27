<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:150',
            'description' => 'sometimes|string',
            'type' => 'sometimes|in:product,service',
            'condition' => 'nullable|string|max:100',
            'availability_info' => 'nullable|string|max:255',
            'desired_in_return' => 'sometimes|string|max:255',
            'is_active' => 'sometimes|boolean',
            'images' => 'nullable|array',
            'images.*' => 'string|url|max:255',
        ];
    }
}
