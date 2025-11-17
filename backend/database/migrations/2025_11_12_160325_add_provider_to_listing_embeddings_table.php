<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('listing_embeddings', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('embedding')->comment('Which service produced the embedding (openai,gemini,together,hash)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('listing_embeddings', function (Blueprint $table) {
            $table->dropColumn('provider');
        });
    }
};
