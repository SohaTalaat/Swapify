<?php

namespace App\Http\Controllers\Swagger\Sections;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VerificationDocs extends Controller
{
    /**
     * @OA\Tag(
     *     name="ID Verification",
     *     description="Submit and manage ID verification for users and admins"
     * )
     */

    /**
     * @OA\Post(
     *     path="/id-verification",
     *     tags={"ID Verification"},
     *     summary="Submit ID and selfie for verification",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"id_document","selfie"},
     *                 @OA\Property(property="id_document", type="string", format="binary"),
     *                 @OA\Property(property="selfie", type="string", format="binary")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=201, description="Verification request submitted")
     * )
     */

    public function test1() {}

    /**
     * @OA\Get(
     *     path="/admin/id-verification/{id}",
     *     tags={"Admin - ID Verification"},
     *     summary="View user verification details",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Verification details fetched")
     * )
     */
    public function test2() {}
}
