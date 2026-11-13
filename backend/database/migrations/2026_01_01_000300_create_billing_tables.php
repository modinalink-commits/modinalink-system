<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $t) {
            $t->id();
            $t->string('number', 24)->unique();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('status', 12)->default('draft')->index(); // draft | issued | paid | void | refunded
            $t->unsignedBigInteger('total_bdt')->default(0);
            $t->date('due_date')->nullable();
            $t->string('note')->nullable();
            $t->timestamp('issued_at')->nullable();
            $t->timestamp('paid_at')->nullable();
            $t->timestamps();
        });

        Schema::create('invoice_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $t->string('description');
            $t->unsignedInteger('qty')->default(1);
            $t->unsignedBigInteger('unit_bdt');
        });

        Schema::create('payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('gateway', 20);
            $t->string('status', 12)->default('pending')->index(); // pending | review | paid | failed | refunded
            $t->unsignedBigInteger('amount_bdt');
            $t->string('tran_id', 40)->unique();              // our reference sent to the gateway
            $t->string('gateway_txn_id')->nullable();
            $t->string('proof_reference')->nullable();         // bank transfer: customer-supplied reference
            $t->json('payload')->nullable();
            $t->timestamp('verified_at')->nullable();
            $t->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
        });

        Schema::create('gateway_configs', function (Blueprint $t) {
            $t->id();
            $t->string('gateway', 20)->unique();
            $t->boolean('enabled')->default(false);
            $t->string('mode', 10)->default('sandbox');         // sandbox | live
            $t->decimal('fee_percent', 5, 2)->nullable();
            $t->text('credentials')->nullable();                // encrypted array, never returned by the API
            $t->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->date('renews_on');
            $t->unsignedBigInteger('amount_bdt');
            $t->string('status', 12)->default('active');
            $t->unsignedTinyInteger('last_reminder_days')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['subscriptions','gateway_configs','payments','invoice_items','invoices'] as $tbl) Schema::dropIfExists($tbl);
    }
};
