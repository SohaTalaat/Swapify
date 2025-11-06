<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;

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
        Log::info('Paymob Callback', $request->all());

        if ($request->has('obj') && isset($request->obj['success']) && $request->obj['success'] == true) {
            Payment::create([
                'user_id' => $request->obj['order']['merchant_order_id'] ?? null,
                'method' => 'paymob',
                'amount' => $request->obj['amount_cents'] / 100,
                'currency' => $request->obj['currency'],
                'status' => 'success',
                'transaction_id' => $request->obj['id'],
                'details' => json_encode($request->obj ?? $request->all())
            ]);

            return response()->json(['message' => 'Payment successful']);
        }

        return response()->json(['error' => 'Payment failed']);
    }

    /**
     * 🔹 Step 3: Webhook for server-to-server notification (secure)
     */
    public function webhook(Request $request)
    {
        Log::info('Paymob Webhook Triggered', $request->all());

        // Validate HMAC
        $receivedHmac = $request->input('hmac');
        $calculatedHmac = hash_hmac('sha512', $this->generateHmacString($request->obj), env('PAYMOB_HMAC'));

        if ($receivedHmac !== $calculatedHmac) {
            Log::warning('Invalid HMAC signature from Paymob');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        // Save payment info
        if ($request->obj['success'] === true) {
            Payment::updateOrCreate(
                ['transaction_id' => $request->obj['id']],
                [
                    'user_id' => $request->obj['order']['merchant_order_id'] ?? null,
                    'method' => 'paymob',
                    'amount' => $request->obj['amount_cents'] / 100,
                    'currency' => $request->obj['currency'],
                    'status' => 'success',
                    'details' => json_encode($request->obj ?? $request->all())
                ]
            );
        } else {
            Log::warning('Payment failed', $request->all());
        }

        return response()->json(['status' => 'received']);
    }

    /**
     * 🔹 Helper: Generate HMAC validation string
     */
    private function generateHmacString($obj)
    {
        return $obj['amount_cents'] .
            $obj['created_at'] .
            $obj['currency'] .
            $obj['error_occured'] .
            $obj['has_parent_transaction'] .
            $obj['id'] .
            $obj['integration_id'] .
            $obj['is_3d_secure'] .
            $obj['is_auth'] .
            $obj['is_capture'] .
            $obj['is_refunded'] .
            $obj['is_standalone_payment'] .
            $obj['is_voided'] .
            $obj['order']['id'] .
            $obj['owner'] .
            $obj['pending'] .
            $obj['source_data_pan'] .
            $obj['source_data_sub_type'] .
            $obj['success'];
    }
}
