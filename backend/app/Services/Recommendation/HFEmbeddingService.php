<?php

namespace App\Services\Recommendation;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\ListingEmbedding;
use App\Models\Listing;

class HFEmbeddingService
{
    protected string $token;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->token = env('HF_API_TOKEN');
        $this->model = env('HF_EMBED_MODEL', 'sentence-transformers/all-MiniLM-L6-v2');
        $this->baseUrl = "https://api-inference.huggingface.co/models/{$this->model}";
    }

    public function embedText(string $text): ?array
    {
        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
        ])->post($this->baseUrl, ['inputs' => $text]);

        if (! $response->successful()) {
            Log::error('HF embed failed: ' . $response->body());  // ✅ استخدم Log بدل \Log
            return null;
        }

        $body = $response->json();

        if (isset($body[0]) && is_array($body[0])) {
            return array_map(fn($v) => (float) $v, $body[0]);
        }

        return null;
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
