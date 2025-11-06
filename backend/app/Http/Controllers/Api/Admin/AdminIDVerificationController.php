<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\IDVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AdminIDVerificationController extends Controller
{
    // عرض كل الطلبات
    public function index()
    {
        $verifications = IDVerification::with('user')->get(); // علاقة user
        return response()->json($verifications);
    }

    // عرض طلب واحد مع signed URLs
    public function show($id)
    {
        $verification = IDVerification::with('user')->findOrFail($id);

        return response()->json([
            'id' => $verification->id,
            'user' => $verification->user,
            'id_document_url' => $verification->id_document_url,
            'selfie_url' => $verification->selfie_url,
            'status' => $verification->status,
            'rejection_reason' => $verification->rejection_reason,
        ]);
    }

    // الموافقة
public function approve($id)
{
    DB::transaction(function() use ($id) {
        // جلب الطلب
        $verification = IDVerification::findOrFail($id);

        // تحديث حالة التحقق
        $verification->update([
            'status' => 'verified',
            'verified_by_admin_id' => Auth::id(),
        ]);

        // تحديث حالة المستخدم مباشرة
        User::where('id', $verification->user_id)->update(['is_id_verified' => 1]);
    });

    return response()->json(['message' => 'Verification approved']);
}


    // الرفض
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $verification = IDVerification::findOrFail($id);
        $verification->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason
        ]);

        return response()->json(['message' => 'Verification rejected']);
    }
}
