<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Listing;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['prompt' => 'required|string']);
        $prompt = trim($request->input('prompt'));
        $lowerPrompt = strtolower($prompt);

        /**
         * ----------------------------------------------------
         * 1) Stop Words (words that should be ignored)
         * ----------------------------------------------------
         */
        $stopWords = [
            'hi','hello','hey','thanks','thank','please','ok','okay',
            'search','find','help','good','morning','night',
            'i','want','need','am','are','is','the','what','how',
            'انا','عايز','محتاج','ابغى','اريد','لو','من','عن','هي','هو','السلام','مرحبا','اهلا'

        ];

        /**
         * ----------------------------------------------------
         * 2) Tokenize and filter prompt words
         * ----------------------------------------------------
         */
        $rawTokens = explode(' ', preg_replace('/[^a-zA-Z0-9\p{Arabic}\s]/u', '', $lowerPrompt));
        $tokens = [];

        foreach ($rawTokens as $token) {
            $token = trim($token);

            // Ignore very short words
            if (strlen($token) < 3) continue;

            // Ignore stopwords
            if (in_array($token, $stopWords)) continue;

            $tokens[] = $token;
        }

        /**
         * ----------------------------------------------------
         * 3) If no valid tokens, use Gemini response
         * ----------------------------------------------------
         */
        if (empty($tokens)) {
            return $this->replyWithGemini($prompt);
        }

        /**
         * ----------------------------------------------------
         * 4) Check if any token exists inside the database
         * ----------------------------------------------------
         */
        $isOfferQuery = Listing::where(function ($q) use ($tokens) {
            foreach ($tokens as $token) {

                // Word-boundary match (prevents matching inside words)
                $q->orWhereRaw("LOWER(title) LIKE ?", ["% {$token} %"])
                  ->orWhereRaw("LOWER(description) LIKE ?", ["% {$token} %"])
                  ->orWhereRaw("LOWER(desired_in_return) LIKE ?", ["% {$token} %"]);

                // Normal LIKE match as fallback
                $q->orWhere('title', 'LIKE', "%{$token}%")
                  ->orWhere('description', 'LIKE', "%{$token}%")
                  ->orWhere('desired_in_return', 'LIKE', "%{$token}%");
            }
        })->exists();

        /**
         * ----------------------------------------------------
         * 5) If classified as an offer query → fetch offers
         * ----------------------------------------------------
         */
        if ($isOfferQuery) {
            $offers = Listing::where(function ($q) use ($tokens) {
                foreach ($tokens as $token) {
                    $q->orWhere('title', 'LIKE', "%{$token}%")
                      ->orWhere('description', 'LIKE', "%{$token}%")
                      ->orWhere('desired_in_return', 'LIKE', "%{$token}%");
                }
            })
            ->limit(5)
            ->get();

            if ($offers->isEmpty()) {
                return response()->json([
                    'reply' => "Sorry, no related offers were found."
                ]);
            }

            $reply = "🔎 **Found {$offers->count()} offers:**\n\n";

            foreach ($offers as $offer) {
                $reply .= "📌 **{$offer->title}**\n";
                $reply .= "▫ Condition: {$offer->condition}\n";
                $reply .= "▫ Description: " . Str::limit($offer->description, 100) . "\n";

                if ($offer->desired_in_return) {
                    $reply .= "▫ Desired in return: " . Str::limit($offer->desired_in_return, 80) . "\n";
                }

                $reply .= "\n";
            }

            return response()->json(['reply' => $reply]);
        }

        /**
         * ----------------------------------------------------
         * 6) Otherwise → respond using Gemini
         * ----------------------------------------------------
         */
        return $this->replyWithGemini($prompt);
    }


    /**
     * ----------------------------------------------------
     * Gemini API response function
     * ----------------------------------------------------
     */
    private function replyWithGemini($prompt)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Gemini API key missing'], 500);
        }

        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";

        $payload = [
            "contents" => [
                ["parts" => [["text" => $prompt]]]
            ]
        ];

        try {
            $res = Http::post($url, $payload);
            $json = $res->json();
            $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '⚠️ No reply.';

            return response()->json(['reply' => $text]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gemini Request failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
