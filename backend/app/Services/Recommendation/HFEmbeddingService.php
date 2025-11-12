<?php

namespace App\Services\Recommendation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ListingEmbedding;
use App\Models\Listing;

class HFEmbeddingService
{
    protected const EMBEDDING_DIM = 384;

    public function __construct()
    {
        // API keys are loaded per-method from .env
    }

    public function embedText(string $text): ?array
    {
        // Try in order of preference

        // 1. Try OpenAI first (free with account, pay-per-use after free credits)
        $openaiEmbedding = $this->tryOpenAIEmbedding($text);
        if ($openaiEmbedding) {
            return $openaiEmbedding;
        }

        // 2. Try Google Gemini (free tier available)
        $geminiEmbedding = $this->tryGeminiEmbedding($text);
        if ($geminiEmbedding) {
            return $geminiEmbedding;
        }

        // Last resort: hash-based
        Log::warning('OpenAI and Gemini embeddings failed - using hash-based fallback');
        return $this->generateLocalEmbedding($text);
    }

    private function tryOpenAIEmbedding(string $text): ?array
    {
        try {
            $apiKey = env('OPENAI_API_KEY');
            if (empty($apiKey)) {
                return null;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/embeddings', [
                'input' => $text,
                'model' => 'text-embedding-3-small', // Free model, 1536 dimensions
            ]);

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['data'][0]['embedding']) && is_array($body['data'][0]['embedding'])) {
                    Log::info('✅ Used OpenAI embedding');
                    // Resize to 384 dimensions for consistency
                    return $this->resizeEmbedding($body['data'][0]['embedding'], 384);
                }
            } else {
                Log::warning('OpenAI embedding failed', ['status' => $response->status()]);
            }
        } catch (\Exception $e) {
            Log::debug('OpenAI embedding unavailable: ' . $e->getMessage());
        }

        return null;
    }

    private function tryGeminiEmbedding(string $text): ?array
    {
        try {
            $apiKey = env('GEMINI_API_KEY');
            if (empty($apiKey)) {
                return null;
            }

            $response = Http::timeout(30)->post(
                'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=' . $apiKey,
                [
                    'model' => 'models/text-embedding-004',
                    'content' => [
                        'parts' => [
                            ['text' => $text]
                        ]
                    ]
                ],
                ['key' => $apiKey]
            );

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['embedding']['values']) && is_array($body['embedding']['values'])) {
                    Log::info('✅ Used Google Gemini embedding');
                    return array_map(fn($v) => (float) $v, $body['embedding']['values']);
                }
            } else {
                Log::warning('Gemini embedding failed', ['status' => $response->status()]);
            }
        } catch (\Exception $e) {
            Log::debug('Gemini embedding unavailable: ' . $e->getMessage());
        }

        return null;
    }

    private function tryTogetherAIEmbedding(string $text): ?array
    {
        try {
            $apiKey = env('TOGETHER_API_KEY');
            if (empty($apiKey)) {
                return null;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.together.xyz/v1/embeddings', [
                'input' => $text,
                'model' => 'togethercomputer/m2-bert-80M-32k-retrieval',
            ]);

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['data'][0]['embedding']) && is_array($body['data'][0]['embedding'])) {
                    Log::info('✅ Used Together AI embedding');
                    return array_map(fn($v) => (float) $v, $body['data'][0]['embedding']);
                }
            } else {
                Log::warning('Together AI failed', ['status' => $response->status()]);
            }
        } catch (\Exception $e) {
            Log::debug('Together AI unavailable: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Resize embedding to target dimensions using linear interpolation
     */
    private function resizeEmbedding(array $embedding, int $targetDim): array
    {
        $currentDim = count($embedding);

        if ($currentDim === $targetDim) {
            return $embedding;
        }

        $resized = [];
        for ($i = 0; $i < $targetDim; $i++) {
            $sourceIndex = ($i / $targetDim) * $currentDim;
            $lowerIndex = (int) floor($sourceIndex);
            $upperIndex = min((int) ceil($sourceIndex), $currentDim - 1);

            if ($lowerIndex === $upperIndex) {
                $resized[] = $embedding[$lowerIndex];
            } else {
                $fraction = $sourceIndex - $lowerIndex;
                $resized[] = $embedding[$lowerIndex] * (1 - $fraction) + $embedding[$upperIndex] * $fraction;
            }
        }

        return $resized;
    }

    private function generateLocalEmbedding(string $text): array
    {
        $hash = hash('sha256', $text);
        $embedding = [];

        for ($i = 0; $i < self::EMBEDDING_DIM; $i++) {
            $hexPair = substr($hash, ($i * 2) % strlen($hash), 2);
            $byte = hexdec($hexPair);
            $normalized = ($byte / 255) * 2 - 1;
            $embedding[] = (float) $normalized;
        }

        return $embedding;
    }

    public function createEmbeddingForListing(Listing $listing): ?ListingEmbedding
    {
        $text = implode("\n", array_filter([
            $listing->title,
            $listing->description,
            $listing->category?->name ?? '',
            $listing->desired_in_return ?? '',
        ]));

        $embedding = $this->embedText($text);

        if (! $embedding) {
            return null;
        }

        return ListingEmbedding::updateOrCreate(
            ['listing_id' => $listing->id],
            ['embedding' => $embedding]
        );
    }
}
