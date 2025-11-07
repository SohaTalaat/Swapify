<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;
use App\Models\PendingPayment;
use App\Models\User;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class PaymobController extends Controller
{
    private $baseUrl;
    private $apiKey;
    private $integrationIdCard;
    private $integrationIdWallet;
    private $currency;

    public function __construct()
    {
        $this->apiKey = env('PAYMOB_API_KEY');
        $this->baseUrl = rtrim(env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api'), '/');
        $this->integrationIdCard = env('PAYMOB_INTEGRATION_ID_CARD');
        $this->integrationIdWallet = env('PAYMOB_INTEGRATION_ID_WALLET');
        $this->currency = env('PAYMOB_CURRENCY', 'EGP');

        if (!$this->apiKey || !$this->integrationIdCard || !$this->integrationIdWallet) {
            Log::critical('PaymobController: Missing required .env variables');
        }
    }

    // بدء عملية الدفع
    public function initPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|in:card,wallet',
            'wallet_number' => 'nullable|string|required_if:payment_type,wallet'
        ]);

        try {
            // 1. Auth Token
            $authResponse = Http::post("$this->baseUrl/auth/tokens", [
                'api_key' => $this->apiKey
            ]);

            if (!$authResponse->successful()) {
                Log::error('Paymob Auth Failed', $authResponse->json());
                return response()->json(['error' => 'فشل الاتصال بـ Paymob'], 500);
            }

            $token = $authResponse->json('token');

            // 2. إنشاء Order مع merchant_order_id
            $merchantOrderId = Auth::id() . '_' . now()->timestamp;
            $orderResponse = Http::post("$this->baseUrl/ecommerce/orders", [
                'auth_token' => $token,
                'delivery_needed' => false,
                'amount_cents' => $request->amount * 100,
                'currency' => $this->currency,
                'merchant_order_id' => $merchantOrderId,
                'items' => [],
            ]);

            if (!$orderResponse->successful()) {
                Log::error('Paymob Order Failed', $orderResponse->json());
                return response()->json(['error' => 'فشل إنشاء الطلب'], 500);
            }

            $orderData = $orderResponse->json();
            $orderId = $orderData['id'];

            // حفظ الطلب مؤقتًا في جدول pending_payments
            PendingPayment::create([
                'user_id' => Auth::id(),
                'order_id' => $orderId,
                'merchant_order_id' => $merchantOrderId,
                'amount' => $request->amount,
                'status' => 'pending'
            ]);

            Log::info('PendingPayment saved', ['order_id' => $orderId, 'user_id' => Auth::id()]);

            // 3. إنشاء Payment Key
            $integrationId = $request->payment_type === 'card'
                ? $this->integrationIdCard
                : $this->integrationIdWallet;

            $billingData = $this->getBillingData();

            $paymentKeyResponse = Http::post("$this->baseUrl/acceptance/payment_keys", [
                'auth_token' => $token,
                'amount_cents' => $request->amount * 100,
                'expiration' => 3600,
                'order_id' => $orderId,
                'billing_data' => $billingData,
                'currency' => $this->currency,
                'integration_id' => $integrationId
            ]);

            if (!$paymentKeyResponse->successful()) {
                Log::error('Paymob Payment Key Failed', $paymentKeyResponse->json());
                return response()->json(['error' => 'فشل إنشاء مفتاح الدفع'], 500);
            }

            $paymentToken = $paymentKeyResponse->json('token');

            // 4. Card: إرجاع iframe
            if ($request->payment_type === 'card') {
                $iframeId = env('PAYMOB_IFRAME_ID');
                if (!$iframeId) {
                    return response()->json(['error' => 'Iframe ID غير مُعرّف'], 500);
                }
                $iframeUrl = "https://accept.paymob.com/api/acceptance/iframes/$iframeId?payment_token=$paymentToken";
                return response()->json(['url' => $iframeUrl]);
            }

            // 5. Wallet: دفع مباشر
            $walletResponse = Http::post("$this->baseUrl/acceptance/payments/pay", [
                'source' => [
                    'identifier' => $request->wallet_number,
                    'subtype' => 'WALLET'
                ],
                'payment_token' => $paymentToken
            ]);

            $walletData = $walletResponse->json();
            $success = $walletData['success'] ?? false;

            if ($success) {
                $this->handleSuccessfulPayment($walletData, Auth::id());
                return response()->json([
                    'message' => 'تم الدفع بنجاح عبر المحفظة',
                    'subscription' => User::find(Auth::id())->fresh()->subscription
                ]);
            }

            return response()->json(['error' => 'فشل الدفع عبر المحفظة', 'details' => $walletData], 400);

        } catch (\Exception $e) {
            Log::error('Paymob initPayment Exception: ' . $e->getMessage());
            return response()->json(['error' => 'خطأ في معالجة الدفع'], 500);
        }
    }

    // Callback: إعادة توجيه المستخدم
    public function callback(Request $request)
    {
        Log::info('Paymob Callback', $request->all());
        $success = $request->query('success') === 'true';
        return redirect($success
            ? 'http://localhost:4200/payment-success'
            : 'http://localhost:4200/payment-failed'
        );
    }

    // Webhook: التحديث النهائي من Paymob
    public function webhook(Request $request)
    {
        $input = $request->all();
        Log::info('Paymob Webhook Received', $input);

        $obj = $input['obj'] ?? $input;
        $type = $input['type'] ?? 'unknown';
        $receivedHmac = $input['hmac'] ?? null;

        // تحقق من HMAC (للـ TRANSACTION فقط)
        if ($type === 'TRANSACTION' && $receivedHmac) {
            $concatenated = $this->buildHmacString($obj);
            $calculatedHmac = hash_hmac('sha512', $concatenated, env('PAYMOB_HMAC'));

            if (!hash_equals($calculatedHmac, $receivedHmac)) {
                Log::warning('Invalid HMAC', ['received' => $receivedHmac, 'calculated' => $calculatedHmac]);
                return response()->json(['error' => 'توقيع غير صالح'], 403);
            }
            Log::info('HMAC Validated');
        }

        // معالجة الدفع الناجح فقط
        if ($type !== 'TRANSACTION' || empty($obj['success'])) {
            return response()->json(['status' => 'ignored']);
        }

        $paymobOrderId = $obj['order']['id'] ?? null;
        if (!$paymobOrderId) {
            Log::warning('Webhook: No order ID');
            return response()->json(['error' => 'طلب غير معروف'], 400);
        }

        // البحث عن الطلب المؤقت
        $pending = PendingPayment::where('order_id', $paymobOrderId)->first();
        if (!$pending) {
            Log::warning('No pending payment found', ['order_id' => $paymobOrderId]);
            return response()->json(['error' => 'الطلب غير موجود'], 404);
        }

        $userId = $pending->user_id;
        $amount = ($obj['amount_cents'] ?? 0) / 100;

        // حفظ الدفع
        $payment = Payment::updateOrCreate(
            ['transaction_id' => $obj['id']],
            [
                'user_id' => $userId,
                'method' => 'paymob',
                'amount' => $amount,
                'currency' => $obj['currency'] ?? 'EGP',
                'status' => 'success',
                'details' => json_encode($obj)
            ]
        );

        Log::info('Payment Saved', ['payment_id' => $payment->id]);

        // تفعيل الاشتراك
        $user = User::find($userId);
        if ($user) {
            $tier = $this->determineTierFromAmount($amount);
            $this->updateOrCreateSubscription($user, $tier);
            Log::info("Subscription activated: user {$userId}, tier: {$tier}");
        }

        // حذف الطلب المؤقت
        $pending->delete();

        return response()->json(['status' => 'success']);
    }

    // بناء سلسلة HMAC بدقة
    private function buildHmacString($obj)
    {
        return
            ($obj['amount_cents'] ?? '') .
            ($obj['created_at'] ?? '') .
            ($obj['currency'] ?? '') .
            ($obj['error_occured'] ? 'true' : 'false') .
            ($obj['has_parent_transaction'] ? 'true' : 'false') .
            ($obj['id'] ?? '') .
            ($obj['integration_id'] ?? '') .
            ($obj['is_3d_secure'] ? 'true' : 'false') .
            ($obj['is_auth'] ? 'true' : 'false') .
            ($obj['is_capture'] ? 'true' : 'false') .
            ($obj['is_refunded'] ? 'true' : 'false') .
            ($obj['is_standalone_payment'] ? 'true' : 'false') .
            ($obj['is_voided'] ? 'true' : 'false') .
            ($obj['order']['id'] ?? '') .
            ($obj['owner'] ?? '') .
            ($obj['pending'] ? 'true' : 'false') .
            ($obj['source_data']['pan'] ?? '') .
            ($obj['source_data']['sub_type'] ?? '') .
            ($obj['source_data']['type'] ?? '') .
            ($obj['success'] ? 'true' : 'false');
    }

    // بيانات الفاتورة
    private function getBillingData()
    {
        $user = Auth::user();
        return [
            "apartment" => "NA",
            "email" => $user->email,
            "floor" => "NA",
            "first_name" => $user->full_name ?? $user->username ?? 'User',
            "street" => "NA",
            "building" => "NA",
            "phone_number" => $user->phone ?? "01000000000",
            "shipping_method" => "NA",
            "postal_code" => "NA",
            "city" => $user->location ?? "Cairo",
            "country" => "EG",
            "last_name" => $user->full_name ?? $user->username ?? 'User',
            "state" => "NA"
        ];
    }

    // معالجة الدفع الناجح (للـ Wallet)
    private function handleSuccessfulPayment($data, $userId)
    {
        $amount = ($data['amount_cents'] ?? 0) / 100;
        Payment::create([
            'user_id' => $userId,
            'method' => 'paymob_wallet',
            'amount' => $amount,
            'currency' => $data['currency'] ?? 'EGP',
            'status' => 'success',
            'transaction_id' => $data['id'],
            'details' => json_encode($data)
        ]);

        $user = User::find($userId);
        $tier = $this->determineTierFromAmount($amount);
        $this->updateOrCreateSubscription($user, $tier);
    }

    // تحديد الفئة
    private function determineTierFromAmount($amount)
    {
        return match (true) {
            $amount >= 20 => 'pro',
            $amount >= 10 => 'basic',
            default => 'free'
        };
    }

    // تفعيل/تحديث الاشتراك
    private function updateOrCreateSubscription($user, $tier)
    {
        $limits = ['free' => 2, 'basic' => 5, 'pro' => 10];
        $barterLimit = $limits[$tier] ?? 2;

        Subscription::updateOrCreate(
            ['user_id' => $user->id],
            [
                'tier' => $tier,
                'start_date' => now(),
                'end_date' => now()->addMonth(),
                'payment_method' => 'paymob',
                'is_active' => true,
                'barter_limit' => $barterLimit,
                'barters_used' => 0,
            ]
        );

        $user->update(['subscription_tier' => $tier]);
    }
}