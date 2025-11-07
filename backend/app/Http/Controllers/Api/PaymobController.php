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
use Exception;

class PaymobController extends Controller
{
    private $baseUrl;
    private $apiKey;
    private $integrationIdCard;
    private $integrationIdWallet;
    private $currency;

    public function __construct()
    {
        // Validate required environment variables on instantiation
        $this->apiKey = env('PAYMOB_API_KEY');
        $this->baseUrl = rtrim(env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api'), '/');
        $this->integrationIdCard = env('PAYMOB_INTEGRATION_ID_CARD');
        $this->integrationIdWallet = env('PAYMOB_INTEGRATION_ID_WALLET');
        $this->currency = env('PAYMOB_CURRENCY', 'EGP'); // Default to EGP

        if (!$this->apiKey || !$this->integrationIdCard || !$this->integrationIdWallet) {
            Log::critical('PaymobController: Missing required environment variables (PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID_CARD, PAYMOB_INTEGRATION_ID_WALLET)');
            // You might want to throw an exception here or handle this differently
            // For now, let's assume they are set correctly for the request flow.
        }
    }

    /**
     * Step 1: Initialize payment (Card or Wallet)
     */
    public function initPayment(Request $request)
    {
        Log::info('Paymob initPayment called', $request->all());

        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|in:card,wallet',
            'wallet_number' => 'nullable|string' // Required for wallet
        ]);

        if ($request->payment_type === 'wallet' && !$request->wallet_number) {
            return response()->json(['error' => 'Wallet number is required for wallet payments.'], 400);
        }

        try {
            // --- 1. Get Auth Token ---
            $authResponse = Http::post("$this->baseUrl/auth/tokens", [
                'api_key' => $this->apiKey
            ]);

            if (!$authResponse->successful()) {
                Log::error('Paymob Auth Request Failed', ['status' => $authResponse->status(), 'body' => $authResponse->body()]);
                return response()->json(['error' => 'Payment initialization failed: Auth request failed'], 500);
            }

            $authData = $authResponse->json();
            Log::debug('Paymob Auth Response', $authData);

            if (!isset($authData['token'])) {
                Log::error('Paymob Auth Response Missing Token', $authData);
                return response()->json(['error' => 'Payment initialization failed: Invalid auth response'], 500);
            }

            $token = $authData['token'];

            // --- 2. Create Order ---
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
                Log::error('Paymob Order Request Failed', ['status' => $orderResponse->status(), 'body' => $orderResponse->body()]);
                return response()->json(['error' => 'Payment initialization failed: Order creation failed'], 500);
            }

            $orderData = $orderResponse->json();
            Log::debug('Paymob Order Response', $orderData);

            if (!isset($orderData['id'])) {
                Log::error('Paymob Order Response Missing ID', $orderData);
                return response()->json(['error' => 'Payment initialization failed: Invalid order response'], 500);
            }

            $orderId = $orderData['id'];

            // --- 3. Create Payment Key ---
            $integrationId = $request->payment_type === 'card' ? $this->integrationIdCard : $this->integrationIdWallet;

            $billingData = [
                "apartment" => "NA",
                "email" => Auth::user()->email,
                "floor" => "NA",
                "first_name" => Auth::user()->full_name ?? Auth::user()->username ?? 'User',
                "street" => "NA",
                "building" => "NA",
                "phone_number" => Auth::user()->phone ?? "01000000000",
                "shipping_method" => "NA",
                "postal_code" => "NA",
                "city" => Auth::user()->location ?? "Cairo",
                "country" => "EG",
                "last_name" => Auth::user()->full_name ?? Auth::user()->username ?? 'User',
                "state" => "NA"
            ];

            $paymentKeyResponse = Http::post("$this->baseUrl/acceptance/payment_keys", [
                'auth_token' => $token,
                'amount_cents' => $request->amount * 100,
                'expiration' => 3600, // 1 hour
                'order_id' => $orderId,
                'billing_data' => $billingData,
                'currency' => $this->currency,
                'integration_id' => $integrationId
            ]);

            if (!$paymentKeyResponse->successful()) {
                Log::error('Paymob Payment Key Request Failed', ['status' => $paymentKeyResponse->status(), 'body' => $paymentKeyResponse->body()]);
                return response()->json(['error' => 'Payment initialization failed: Payment key creation failed'], 500);
            }

            $paymentKeyData = $paymentKeyResponse->json();
            Log::debug('Paymob Payment Key Response', $paymentKeyData);

            if (!isset($paymentKeyData['token'])) {
                Log::error('Paymob Payment Key Response Missing Token', $paymentKeyData);
                return response()->json(['error' => 'Payment initialization failed: Invalid payment key response'], 500);
            }

            $paymentToken = $paymentKeyData['token'];

            // --- 4. Return Response ---
            if ($request->payment_type === 'card') {
                $iframeId = env('PAYMOB_IFRAME_ID');
                if (!$iframeId) {
                    Log::error('PAYMOB_IFRAME_ID is not set in .env');
                    return response()->json(['error' => 'Payment initialization failed: IFrame ID not configured'], 500);
                }
                $iframeUrl = "https://accept.paymob.com/api/acceptance/iframes/$iframeId?payment_token=$paymentToken";
                return response()->json(['url' => $iframeUrl]);
            } else { // Wallet
                // Initiate wallet payment directly
                $walletPaymentResponse = Http::post("$this->baseUrl/acceptance/payments/pay", [
                    'source' => [
                        'identifier' => $request->wallet_number,
                        'subtype' => 'WALLET'
                    ],
                    'payment_token' => $paymentToken
                ]);

                if (!$walletPaymentResponse->successful()) {
                    Log::error('Paymob Wallet Payment Request Failed', ['status' => $walletPaymentResponse->status(), 'body' => $walletPaymentResponse->body()]);
                    return response()->json(['error' => 'Wallet payment failed at initiation'], 500);
                }

                $walletPaymentData = $walletPaymentResponse->json();
                Log::debug('Paymob Wallet Payment Response', $walletPaymentData);

                // Check for success in wallet response
                $success = filter_var(data_get($walletPaymentData, 'success', false), FILTER_VALIDATE_BOOLEAN);

                if ($success) {
                    // Handle successful wallet payment (similar to callback/webhook logic)
                    $amount = data_get($walletPaymentData, 'amount_cents', 0) / 100;
                    $tier = $this->determineTierFromAmount($amount);
                    $userId = Auth::id();
                    $user = User::find($userId);

                    if (!$user) {
                        Log::error("User not found for wallet payment by ID: $userId");
                        return response()->json(['error' => 'User not found'], 404);
                    }

                    // Create Payment Record
                    Payment::create([
                        'user_id' => $user->id,
                        'method' => 'paymob_wallet',
                        'amount' => $amount,
                        'currency' => data_get($walletPaymentData, 'currency', $this->currency),
                        'status' => 'success',
                        'transaction_id' => data_get($walletPaymentData, 'id'),
                        'details' => json_encode($walletPaymentData)
                    ]);

                    // Update or Create Subscription
                    $this->updateOrCreateSubscription($user, $tier);

                    return response()->json([
                        'message' => 'Wallet payment successful',
                        'subscription' => $user->fresh()->subscription
                    ]);
                } else {
                    // Log details for failed wallet payment
                    Log::warning('Wallet payment not successful', $walletPaymentData);
                    $message = data_get($walletPaymentData, 'data_message', 'Wallet payment failed');
                    return response()->json(['error' => $message], 400);
                }
            }
        } catch (Exception $e) {
            Log::error('Paymob initPayment Exception: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Payment initialization failed due to a server error.'], 500);
        }
    }

    // ... (keep your callback and webhook methods as they are now, assuming they are working or you will debug them separately) ...

    /**
     *  Step 2: Callback from Paymob (after payment) - Handles redirect
     */
    public function callback(Request $request)
    {
        Log::info('Paymob Callback Received', $request->all());

        try {
            // Handle GET redirect from iframe (user sees success/failure)
            if ($request->isMethod('get')) {
                // This is the redirect after user completes payment in iframe
                // We can't do DB updates here because we don't have the transaction details reliably.
                // The webhook will handle the DB updates.
                // Just redirect user back to frontend.
                return redirect('http://localhost:4200/payment-success');
            }

            // This is a POST from Paymob (should be avoided, prefer webhook for server-side updates)
            // For safety, let's parse the object and attempt to update, but webhook is the truth.
            $obj = $request->input('obj', $request->all());

            $merchantOrderId = data_get($obj, 'order.merchant_order_id') ?? data_get($obj, 'merchant_order_id');
            if (!$merchantOrderId) {
                Log::warning('merchant_order_id missing in callback', $obj);
                return redirect('http://localhost:4200/payment-failed');
            }

            $userId = (int) explode('_', $merchantOrderId)[0] ?? null;
            $user = User::find($userId);

            if (!$user) {
                Log::error("User not found for merchant_order_id: $merchantOrderId");
                return redirect('http://localhost:4200/payment-failed');
            }

            $success = filter_var(data_get($obj, 'success', false), FILTER_VALIDATE_BOOLEAN);

            if ($success) {
                $amount = $obj['amount_cents'] / 100;
                $tier = $this->determineTierFromAmount($amount);

                // Create Payment Record
                Payment::create([
                    'user_id' => $user->id,
                    'method' => 'paymob',
                    'amount' => $amount,
                    'currency' => $obj['currency'] ?? 'EGP',
                    'status' => 'success',
                    'transaction_id' => $obj['id'] ?? null,
                    'details' => json_encode($obj)
                ]);

                // Update or Create Subscription
                $this->updateOrCreateSubscription($user, $tier);

                Log::info("Subscription updated for user {$user->id} — tier: {$tier}");
                // Note: The redirect here might happen after the webhook has already updated the DB.
                // Webhook is the source of truth.
                return redirect('http://localhost:4200/payment-success');
            }

            Log::warning('Payment failed in callback', $obj);
            return redirect('http://localhost:4200/payment-failed');
        } catch (\Exception $e) {
            Log::error('Callback Error: ' . $e->getMessage());
            return redirect('http://localhost:4200/payment-failed');
        }
    }

    /**
     *  Step 3: Webhook for server-to-server notification (secure) - Primary update handler
     */
    public function webhook(Request $request)
    {
        Log::info('Paymob Webhook Triggered', $request->all());

        // Get raw input to avoid potential array/string issues with helpers
        $rawInput = $request->all();
        $receivedHmac = $rawInput['hmac'] ?? null;
        $obj = $rawInput['obj'] ?? $rawInput; // Use raw input as obj if nested under 'obj'
        $type = $rawInput['type'] ?? 'unknown';

        // Validate required data
        if (!$receivedHmac || !isset($obj['id']) || !isset($obj['order']['id'])) {
            Log::warning('Webhook missing required data', $rawInput);
            return response()->json(['error' => 'Missing required data'], 400);
        }

        // HMAC Validation (as per Paymob docs) - Only for TRANSACTION type
        if ($type === 'TRANSACTION') {
            // IMPORTANT: The order and types of fields must match Paymob's exact specification.
            // Based on the log data received, let's reconstruct the string precisely.
            // Log the obj for debugging the exact structure if needed.
            // Log::debug('Webhook obj for HMAC calc:', $obj);

            $amountCents = (string) ($obj['amount_cents'] ?? '');
            $createdAt = $obj['created_at'] ?? ''; // This might be a datetime string, use as is
            $currency = (string) ($obj['currency'] ?? '');
            $errorOccured = ($obj['error_occured'] ?? false) ? 'true' : 'false';
            $hasParentTransaction = ($obj['has_parent_transaction'] ?? false) ? 'true' : 'false';
            $id = (string) ($obj['id'] ?? '');
            $integrationId = (string) ($obj['integration_id'] ?? '');
            $is3dSecure = ($obj['is_3d_secure'] ?? false) ? 'true' : 'false';
            $isAuth = ($obj['is_auth'] ?? false) ? 'true' : 'false';
            $isCapture = ($obj['is_capture'] ?? false) ? 'true' : 'false';
            $isRefunded = ($obj['is_refunded'] ?? false) ? 'true' : 'false';
            $isStandalonePayment = ($obj['is_standalone_payment'] ?? false) ? 'true' : 'false';
            $isVoided = ($obj['is_voided'] ?? false) ? 'true' : 'false';
            $orderId = (string) ($obj['order']['id'] ?? ''); // Get order ID from nested array
            $owner = (string) ($obj['owner'] ?? '');
            $pending = ($obj['pending'] ?? false) ? 'true' : 'false';
            $sourceDataPan = (string) ($obj['source_data']['pan'] ?? ''); // Get pan from nested array
            $sourceDataSubType = (string) ($obj['source_data']['sub_type'] ?? ''); // Get sub_type from nested array
            $success = ($obj['success'] ?? false) ? 'true' : 'false';

            $concatenatedString = $amountCents . $createdAt . $currency . $errorOccured . $hasParentTransaction . $id . $integrationId . $is3dSecure . $isAuth . $isCapture . $isRefunded . $isStandalonePayment . $isVoided . $orderId . $owner . $pending . $sourceDataPan . $sourceDataSubType . $success;

            $calculatedHmac = hash_hmac('sha512', $concatenatedString, env('PAYMOB_HMAC'));

            if ($receivedHmac !== $calculatedHmac) {
                Log::warning('Invalid HMAC signature received', [
                    'received' => $receivedHmac,
                    'calculated' => $calculatedHmac,
                    'concatenated_string' => $concatenatedString, // Log the string used for debugging
                ]);
                return response()->json(['error' => 'Invalid signature'], 401);
            }

            Log::info('Valid HMAC verified for webhook type: ' . $type);
        } else {
            Log::info("Webhook type is not TRANSACTION, skipping HMAC validation: $type");
            // You might still want to validate HMAC for other types if Paymob docs specify it.
            // For now, we proceed without HMAC for non-TRANSACTION types.
        }


        // Process transaction if it's successful and type is TRANSACTION
        if ($type === 'TRANSACTION' && ($obj['success'] ?? false)) {
            // Extract user_id correctly from merchant_order_id
            $merchantOrderId = $obj['order']['merchant_order_id'] ?? null;
            $userId = null;
            if ($merchantOrderId) {
                $userId = (int) explode('_', $merchantOrderId)[0]; // Get user ID from "123_1730000000"
            }

            // Create or Update Payment Record using transaction_id as unique key
            $payment = Payment::updateOrCreate(
                ['transaction_id' => $obj['id']], // Unique key for lookup
                [
                    'user_id' => $userId, // Assign user_id if successfully parsed
                    'method' => 'paymob',
                    'amount' => ($obj['amount_cents'] ?? 0) / 100, // Ensure numeric default
                    'currency' => $obj['currency'] ?? 'EGP',
                    'status' => 'success',
                    'details' => json_encode($obj)
                ]
            );

            // Update Subscription if payment was successful and user exists
            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    $amount = ($obj['amount_cents'] ?? 0) / 100;
                    $tier = $this->determineTierFromAmount($amount);
                    $this->updateOrCreateSubscription($user, $tier);
                    Log::info("Subscription updated via webhook for user {$user->id} — tier: {$tier}");
                } else {
                    Log::warning("User not found for transaction ID {$obj['id']} during webhook processing (user_id: $userId).");
                }
            } else {
                Log::warning("User ID could not be determined from merchant_order_id for transaction ID {$obj['id']} (order_id: {$obj['order']['id']}).");
            }
        } else if ($type === 'TRANSACTION') {
            Log::info("Transaction was not successful, skipping DB updates for transaction ID {$obj['id']}. Status: " . ($obj['success'] ?? 'unknown'));
        }

        return response()->json(['status' => 'received']);
    }


    // ✅ Helper method to determine tier from amount
    private function determineTierFromAmount($amount)
    {
        return match (true) {
            $amount >= 20 => 'pro',
            $amount >= 10 => 'basic',
            default => 'free'
        };
    }

    // ✅ Helper method to update or create subscription
    private function updateOrCreateSubscription($user, $tier)
    {
        $limits = [
            'free' => 2,
            'basic' => 5,
            'pro' => 10
        ];
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
                'barters_used' => 0, // Reset on new subscription
            ]
        );

        $user->update(['subscription_tier' => $tier]);
    }
}
