<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ListingImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $listings = Listing::all();

        foreach ($listings as $listing) {
            foreach (range(1, rand(1, 3)) as $i) {
                ListingImage::create([
                    'listing_id' => $listing->id,
                    'image_url' => "https://res.cloudinary.com/demo/image/upload/v16999999/sample{$i}.jpg",
                    'display_order' => $i,
                ]);
            }
        }
    }
}
