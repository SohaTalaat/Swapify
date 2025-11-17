<?php

namespace App\Http\Requests\Barter;

use Illuminate\Foundation\Http\FormRequest;

class StoreBarterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'receiver_id' => 'required|exists:users,id|different:auth_id',
            'offered_listing_id' => 'required|exists:listings,id',
            'requested_listing_id' => 'required|exists:listings,id|different:offered_listing_id',
            'exchange_type' => 'required|in:delivery,in_person',
            'meeting_location' => 'nullable|string|max:255',
            'meeting_time' => 'nullable|date',
            'shipping_address_id' => 'nullable|exists:addresses,id',
            'shipping_address_text' => 'nullable|string|max:255',
            'transaction_fee_amount' => 'nullable|numeric|min:0',


        ];
    }
}
