<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Http\Requests\Listing\StoreListingRequest;
use App\Http\Requests\Listing\UpdateListingRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\User;


class ListingController extends Controller
{
    public function index()
    {
        return Listing::with(['category', 'images', 'user:id,username,profile_picture_url'])
            ->where('is_active', true)
            ->latest()
            ->get();
    }

    public function store(StoreListingRequest $request)
    {
        $listing = Auth::user()->listings()->create($request->validated());

        if ($request->has('images')) {
            foreach ($request->images as $url) {
                $listing->images()->create(['image_url' => $url]);
            }
        }

        return $listing->load(['category', 'images']);
    }

    public function show(Listing $listing)
    {
        return $listing->load(['category', 'images', 'user:id,username']);
    }

    public function update(UpdateListingRequest $request, Listing $listing)
    {
        $listing->update($request->validated());

        if ($request->has('images')) {
            $listing->images()->delete();
            foreach ($request->images as $url) {
                $listing->images()->create(['image_url' => $url]);
            }
        }

        return $listing->load(['category', 'images']);
    }

    public function destroy(Listing $listing)
    {
        $listing->delete();
        return response('', 204);
    }
}
