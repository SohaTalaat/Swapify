<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
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
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:150',
            'description' => 'required|string',
            'type' => 'required|in:product,service',
            'condition' => 'nullable|required_if:type,product|string|max:100',
            'availability_info' => 'nullable|required_if:type,service|string|max:255',
            'desired_in_return' => 'required|string|max:255',
            'images' => 'nullable|array',
            'images.*' => 'string|url|max:255',
        ];
    }
}
