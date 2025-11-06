<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;

class PaymobController extends Controller
{
    private $baseUrl;
    private $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api');
        $this->apiKey = env('PAYMOB_API_KEY');
    }

    /**
     * Step 1: Initialize payment (Card or Wallet)
     */
    public function initPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|in:card,wallet',
            'wallet_number' => 'nullable|string'
        ]);

        try {
            // 1️⃣ Get Auth Token
            $auth = Http::post("$this->baseUrl/auth/tokens", [
                'api_key' => $this->apiKey
            ])->json();

            $token = $auth['token'];

            // 2️⃣ Create Order
            $order = Http::post("$this->baseUrl/ecommerce/orders", [
                'auth_token' => $token,
                'delivery_needed' => false,
                'amount_cents' => $request->amount * 100,
                'currency' => env('PAYMOB_CURRENCY', 'EGP'),
                'merchant_order_id' => Auth::id() . '_' . now()->timestamp,
                'items' => [],
            ])->json();

            // 3️⃣ Create Payment Key
            $integrationId = $request->payment_type === 'card'
                ? env('PAYMOB_INTEGRATION_ID_CARD')
                : env('PAYMOB_INTEGRATION_ID_WALLET');

            $paymentKey = Http::post("$this->baseUrl/acceptance/payment_keys", [
                'auth_token' => $token,
                'amount_cents' => $request->amount * 100,
                'expiration' => 3600,
                'order_id' => $order['id'],
                'billing_data' => [
                    "apartment" => "NA",
                    "email" => $request->user()->email,
                    "floor" => "NA",
                    "first_name" => $request->user()->full_name ?? $request->user()->username ?? 'User',
                    "street" => "NA",
                    "building" => "NA",
                    "phone_number" => $request->user()->phone ?? "01000000000",
                    "shipping_method" => "NA",
                    "postal_code" => "NA",
                    "city" => "Cairo",
                    "country" => "EG",
                    "last_name" => $request->user()->full_name ?? $request->user()->username ?? 'User',
                    "state" => "NA"
                ],
                'currency' => env('PAYMOB_CURRENCY', 'EGP'),
                'integration_id' => $integrationId
            ])->json();

            $paymentToken = $paymentKey['token'];

            // 4️⃣ Return Payment URL
            if ($request->payment_type === 'card') {
                $iframeId = env('PAYMOB_IFRAME_ID');
                $iframeUrl = "https://accept.paymob.com/api/acceptance/iframes/$iframeId?payment_token=$paymentToken";
                return response()->json(['url' => $iframeUrl]);
            } else {
                // Wallet Payment
                $wallet = Http::post("$this->baseUrl/acceptance/payments/pay", [
                    'source' => [
                        'identifier' => $request->wallet_number,
                        'subtype' => 'WALLET'
                    ],
                    'payment_token' => $paymentToken
                ])->json();

                return response()->json(['wallet_response' => $wallet]);
            }
        } catch (\Exception $e) {
            Log::error('Paymob error: ' . $e->getMessage());
            return response()->json(['error' => 'Payment initialization failed'], 500);
        }
    }

    /**
     *  Step 2: Callback from Paymob (after payment)
     */
    public function callback(Request $request)
    {
        Log::info('📩 Paymob Callback Received', $request->all());

        // If GET, just show success page for frontend
        if ($request->isMethod('get')) {
            return response()->json([
                'message' => 'Thank you! Payment completed successfully.'
            ]);
        }

        try {
            if ($request->has('obj') && isset($request->obj['success']) && $request->obj['success'] == true) {

                // Extract user ID from merchant_order_id (e.g., "5_1730756700")
                $merchantOrderId = $request->obj['order']['merchant_order_id'] ?? null;
                $userId = $merchantOrderId ? explode('_', $merchantOrderId)[0] : null;

                Payment::create([
                    'user_id' => $userId,
                    'method' => 'paymob',
                    'amount' => $request->obj['amount_cents'] / 100,
                    'currency' => $request->obj['currency'],
                    'status' => 'success',
                    'transaction_id' => $request->obj['id'],
                    'details' => json_encode($request->all())
                ]);

                // Optionally activate subscription
                $user = User::find($userId);
                if ($user) {
                    Subscription::updateOrCreate(
                        ['user_id' => $user->id],
                        [
                            'tier' => 'pro', // or detect based on amount
                            'start_date' => now(),
                            'end_date' => now()->addMonth(),
                            'payment_method' => 'paymob',
                            'is_active' => true,
                        ]
                    );
                }

                return response()->json(['message' => 'Payment successful']);
            }

            Log::warning('⚠️ Paymob Callback - Payment failed', $request->all());
            return response()->json(['error' => 'Payment failed']);
        } catch (\Exception $e) {
            Log::error('❌ Paymob Callback Error: ' . $e->getMessage());
            return response()->json(['error' => 'Callback processing failed'], 500);
        }
    }

    /**
     *  Step 3: Webhook for server-to-server notification (secure)
     */
    public function webhook(Request $request)
    {
        Log::info('📡 Paymob Webhook Triggered', $request->all());

        $receivedHmac = $request->input('hmac');
        $obj = $request->input('obj', []);
        $type = $request->input('type', 'unknown');

        // ✅ Choose data to concatenate based on webhook type
        $concatenatedString = '';

        if ($type === 'TRANSACTION' && isset($obj['order'])) {
            $concatenatedString =
                $obj['amount_cents'] .
                $obj['created_at'] .
                $obj['currency'] .
                ($obj['error_occured'] ? 'true' : 'false') .
                ($obj['has_parent_transaction'] ? 'true' : 'false') .
                $obj['id'] .
                $obj['integration_id'] .
                ($obj['is_3d_secure'] ? 'true' : 'false') .
                ($obj['is_auth'] ? 'true' : 'false') .
                ($obj['is_capture'] ? 'true' : 'false') .
                ($obj['is_refunded'] ? 'true' : 'false') .
                ($obj['is_standalone_payment'] ? 'true' : 'false') .
                ($obj['is_voided'] ? 'true' : 'false') .
                $obj['order']['id'] .
                $obj['owner'] .
                ($obj['pending'] ? 'true' : 'false') .
                $obj['source_data_pan'] .
                $obj['source_data_sub_type'] .
                ($obj['success'] ? 'true' : 'false');
        } elseif ($type === 'TOKEN') {
            // Token webhooks use a different payload
            $concatenatedString =
                $obj['id'] .
                $obj['created_at'] .
                $obj['email'] .
                $obj['merchant_id'] .
                $obj['masked_pan'] .
                $obj['token'];
        }

        $calculatedHmac = hash_hmac('sha512', $concatenatedString, env('PAYMOB_HMAC'));

        if ($receivedHmac !== $calculatedHmac) {
            Log::warning('🚫 Invalid HMAC signature received', [
                'received' => $receivedHmac,
                'calculated' => $calculatedHmac,
            ]);
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // ✅ Log success
        Log::info('✅ Valid HMAC verified for webhook type: ' . $type);

        // If it’s a transaction success, record it in DB
        if ($type === 'TRANSACTION' && ($obj['success'] ?? false)) {
            Payment::updateOrCreate(
                ['transaction_id' => $obj['id']],
                [
                    'user_id' => $obj['order']['merchant_order_id'] ?? null,
                    'method' => 'paymob',
                    'amount' => $obj['amount_cents'] / 100,
                    'currency' => $obj['currency'],
                    'status' => 'success',
                    'details' => json_encode($obj)
                ]
            );
        }

        return response()->json(['status' => 'received']);
    }



    /**
     *  Helper: Generate HMAC validation string
     */
    private function generateHmacString($obj)
    {
        $keys = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'has_parent_transaction',
            'id',
            'integration_id',
            'is_3d_secure',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_voided',
            'order.id',
            'owner',
            'pending',
            'source_data.pan',
            'source_data.sub_type',
            'success'
        ];

        $concatenated = '';

        foreach ($keys as $key) {
            $value = data_get($obj, $key, '');
            $concatenated .= $value;
        }

        return $concatenated;
    }
}
