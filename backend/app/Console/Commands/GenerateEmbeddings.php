<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Listing;
use App\Services\Recommendation\HFEmbeddingService;

class GenerateEmbeddings extends Command
{
    protected $signature = 'generate:embeddings';
    protected $description = 'Generate or update embeddings for all listings';

    public function handle(HFEmbeddingService $embedder)
    {
        $this->info('Generating embeddings...');

        $listings = Listing::all();
        foreach ($listings as $listing) {
            $embed = $embedder->createEmbeddingForListing($listing);
            $this->info("Listing #{$listing->id} => " . ($embed ? '✅ OK' : '❌ Failed'));
        }

        $this->info('✅ Done generating embeddings!');
        return Command::SUCCESS;
    }
}
