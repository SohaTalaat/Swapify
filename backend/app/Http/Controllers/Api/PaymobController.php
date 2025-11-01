<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymobController extends Controller
{
    private $baseUrl;
    private $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('app.paymob_base_url', env('PAYMOB_BASE_URL'));
        $this->apiKey = env('PAYMOB_API_KEY');
    }

    public function initPayment(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|in:card,wallet'
        ]);

        try {
            // 1️⃣ Authentication token
            $auth = Http::post("$this->baseUrl/auth/tokens", [
                'api_key' => $this->apiKey
            ])->json();

            $token = $auth['token'];

            // 2️⃣ Create Order
            $order = Http::post("$this->baseUrl/ecommerce/orders", [
                'auth_token' => $token,
                'delivery_needed' => false,
                'amount_cents' => $request->amount * 100, // in cents
                'currency' => env('PAYMOB_CURRENCY', 'EGP'),
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
                    "first_name" => $request->user()->full_name,
                    "street" => "NA",
                    "building" => "NA",
                    "phone_number" => "01111111111",
                    "shipping_method" => "NA",
                    "postal_code" => "NA",
                    "city" => "Cairo",
                    "country" => "EG",
                    "last_name" => $request->user()->full_name,
                    "state" => "NA"
                ],
                'currency' => env('PAYMOB_CURRENCY', 'EGP'),
                'integration_id' => $integrationId
            ])->json();

            $paymentToken = $paymentKey['token'];

            if ($request->payment_type === 'card') {
                $iframeId = env('PAYMOB_IFRAME_ID');
                $iframeUrl = "https://accept.paymob.com/api/acceptance/iframes/$iframeId?payment_token=$paymentToken";
                return response()->json(['url' => $iframeUrl]);
            } else {
                // Wallet Payment
                $wallet = Http::post("$this->baseUrl/acceptance/payments/pay", [
                    'source' => [
                        'identifier' => $request->wallet_number, // e.g. Vodafone number
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
                'details' => json_encode($request->all())
            ]);

            return response()->json(['message' => 'Payment successful']);
        }

        return response()->json(['error' => 'Payment failed']);
    }
}
