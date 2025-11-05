<?php

namespace App\Http\Controllers\Swagger;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * @OA\Info(
 *     title="Swapify API Documentation",
 *     version="1.0.0",
 *     description="Comprehensive API reference for Swapify backend endpoints.",
 *     @OA\Contact(
 *         email="swapifyservices@gmail.com"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://127.0.0.1:8000/api",
 *     description="Local development server"
 * )
 */


class SwaggerController extends Controller
{
    //
}
