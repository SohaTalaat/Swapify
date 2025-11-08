<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
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
   // App/Http/Requests/Message/StoreMessageRequest.php
public function rules(): array
{
    return [
        'content' => 'required|string|max:1000',
        'barter_id' => 'required_without:chat_id|exists:barters,id',
        'chat_id' => 'required_without:barter_id|exists:chats,id',
    ];
}
}
