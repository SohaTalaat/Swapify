<?php

namespace App\Http\Requests\IDVerification;

use Illuminate\Foundation\Http\FormRequest;

class StoreIDVerificationRequest extends FormRequest
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
            'id_document_url' => 'required|url|max:255',
            'selfie_url' => 'required|url|max:255',
        ];
    }
}
