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
        Schema::create('barters', function (Blueprint $table) {
            $table->id();
            $table->enum('status', [
                'proposed',
                'accepted',
                'in_transit',
                'delivered',
                'completed',
                'disputed',
                'cancelled'
            ])->default('proposed');
            $table->enum('exchange_type', ['delivery', 'in_person']);
            $table->text('meeting_location')->nullable();
            $table->timestamp('meeting_time')->nullable();
            $table->foreignId('shipping_address_id')->nullable()->constrained('addresses')->onDelete('set null');
            $table->timestamp('agreed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('transaction_fee_amount', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barters');
    }
};
