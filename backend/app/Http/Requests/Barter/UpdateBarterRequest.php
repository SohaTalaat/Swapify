<?php

namespace App\Http\Requests\Barter;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBarterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:proposed,accepted,in_transit,delivered,completed,disputed,cancelled',
            'agreed_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'transaction_fee_amount' => 'nullable|numeric|min:0',
        ];
    }
}
