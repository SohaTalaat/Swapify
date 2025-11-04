<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class ListingController extends Controller
{
    public function index()
    {
        return Listing::with(['category', 'images', 'user:id,username,profile_picture_url'])
            ->where('is_active', true)
            ->latest()
            ->get();
    }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'category_id' => 'required|exists:categories,id',
    //         'title' => 'required|string|max:255',
    //         'description' => 'nullable|string',
    //         'type' => 'required|string',
    //         'condition' => 'nullable|string|max:100',
    //         'availability_info' => 'nullable|string|max:255',
    //         'desired_in_return' => 'nullable|string|max:255',
    //         'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    //     ]);

    //     $listing = auth()->user()->listings()->create($validated);

    //     if ($request->hasFile('images')) {
    //         foreach ($request->file('images') as $image) {
    //             $path = $image->store('listings', 'public');
    //             $listing->images()->create([
    //                 'image_url' => asset('storage/' . $path),
    //             ]);
    //         }
    //     }

    //     return response()->json([
    //         'message' => 'Listing created successfully',
    //         'data' => $listing->load('images'),
    //     ], 201);
    // }


       public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'images.*' => 'image|mimes:jpg,jpeg,png|max:4096',
        ]);

        // إنشاء العرض
        $listing = Listing::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'category_id' => $request->category_id,
            'condition' => $request->condition,
            'availability_info' => $request->availability_info,
            'desired_in_return' => $request->desired_in_return,
        ]);

        // رفع الصور إلى Cloudinary
      if ($request->hasFile('images')) {
    foreach ($request->file('images') as $image) {
        $uploadedFileUrl = Cloudinary::uploadApi()->upload($image->getRealPath(), [
            'folder' => 'swapify/listings',
        ])['secure_url'];

        $listing->images()->create([
            'image_url' => $uploadedFileUrl,
        ]);
    }
}


        return response()->json([
            'message' => 'Listing created successfully',
            'data' => $listing->load('images'),
        ], 201);
    }

    public function show(Listing $listing)
    {
        return $listing->load(['category', 'images', 'user:id,username']);
    }

    public function update(Request $request, Listing $listing)
    {
        $listing->update($request->all());
        return $listing->load(['category', 'images']);
    }

public function destroy($id)
{
    $listing = Listing::findOrFail($id);

    // حذف الصور من Cloudinary قبل حذف العرض
    foreach ($listing->images as $image) {
        try {
            // استخراج public_id من الرابط
            $publicId = basename(parse_url($image->image_url, PHP_URL_PATH), '.' . pathinfo($image->image_url, PATHINFO_EXTENSION));

            // ✅ الطريقة الصحيحة لحذف الصورة من Cloudinary
            \CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary::uploadApi()->destroy('swapify/listings/' . $publicId);
            
            $image->delete();
        } catch (\Exception $e) {
            \Log::error('خطأ أثناء حذف الصورة من Cloudinary: ' . $e->getMessage());
        }
    }

    $listing->delete();

    return response()->json(['message' => 'Offer deleted successfully']);
}



    public function myOffers(Request $request) //abanoub
{
    $user = $request->user();

    $offers = $user->listings()
        ->with(['category', 'images'])
        ->get();

    return response()->json($offers);
}

}
