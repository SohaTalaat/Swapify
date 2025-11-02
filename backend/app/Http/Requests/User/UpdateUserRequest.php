<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            
            // ✅ تعديل هنا لقبول صور مرفوعة
            'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

            // ✅ لو عندك إعدادات تواصل
            'communication_preferences' => 'nullable|array',
            'communication_preferences.*' => 'in:email,sms,push',
        ];
    }
}
