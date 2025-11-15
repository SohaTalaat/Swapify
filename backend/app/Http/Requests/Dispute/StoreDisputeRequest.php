<?php

namespace App\Http\Requests\Dispute;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Barter;
use Illuminate\Support\Facades\Auth;

class StoreDisputeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Allow only authenticated participants of the barter or admins to create a dispute.
        $user = Auth::user();
        if (!$user) return false;

        // If the user is an admin, allow
        if (property_exists($user, 'is_admin') && $user->is_admin) return true;

        // Check barter_id is present in the request
        $barterId = $this->input('barter_id');
        if (!$barterId) return false;

        $barter = Barter::with('participants')->find($barterId);
        if (!$barter) return false;

        return $barter->participants->contains('id', $user->id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'barter_id' => 'required|exists:barters,id',
            'reason' => 'required|string|max:255',
            'description' => 'required|string|min:10|max:2000',
        ];
    }
}
