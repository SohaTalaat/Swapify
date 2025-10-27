<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::all();
    }

    public function store(StoreCategoryRequest $request)
    {
        return Category::create($request->validated());
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update($request->validated());
        return $category;
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return response('', 204);
    }
}
