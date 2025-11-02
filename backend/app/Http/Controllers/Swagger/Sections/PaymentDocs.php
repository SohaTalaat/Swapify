<?php

namespace App\Http\Controllers\Swagger\Sections;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PaymentDocs extends Controller
{
    /**
     * @OA\Tag(
     *     name="Payments",
     *     description="Manage mock Paymob payment initiation and callbacks"
     * )
     */
    public function test() {}

    /**
     * @OA\Post(
     *     path="/paymob/init",
     *     tags={"Payments"},
     *     summary="Initialize a Paymob payment session",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"amount"},
     *             @OA\Property(property="amount", type="number", example=250.00)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Payment initialized successfully")
     * )
     *
     * @OA\Post(
     *     path="/paymob/callback",
     *     tags={"Payments"},
     *     summary="Handle Paymob callback after payment",
     *     @OA\Response(response=200, description="Payment verified successfully")
     * )
     */
    public function test1() {}
}
