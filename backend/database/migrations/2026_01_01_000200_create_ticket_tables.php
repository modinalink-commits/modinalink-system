<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $t) {
            $t->id();
            $t->string('number', 20)->unique();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $t->string('type', 20)->default('change');     // change | bug | support | new_feature
            $t->string('title');
            $t->text('description');
            // submitted -> scope_review -> (needs_info | rejected | drafting) -> staging_ready -> approved -> deployed -> closed
            $t->string('status', 20)->default('submitted')->index();
            $t->string('staging_url')->nullable();
            $t->string('rollback_point')->nullable();       // required before approval
            $t->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('approved_at')->nullable();
            $t->timestamp('deployed_at')->nullable();
            $t->timestamps();
        });

        Schema::create('ticket_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->text('body');
            $t->boolean('is_internal')->default(false);   // staff-only note
            $t->boolean('ai_assisted')->default(false);   // disclosed to customer when true
            $t->timestamps();
        });

        Schema::create('ticket_events', function (Blueprint $t) {
            $t->id();
            $t->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('from_status', 20)->nullable();
            $t->string('to_status', 20);
            $t->string('note')->nullable();
            $t->timestamp('created_at')->useCurrent();
        });

        // What a customer may edit themselves. v1: content and settings only.
        Schema::create('permission_grants', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('scope', 20);                         // content | settings
            $t->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->unique(['user_id', 'scope']);
        });
    }

    public function down(): void
    {
        foreach (['permission_grants','ticket_events','ticket_messages','tickets'] as $tbl) Schema::dropIfExists($tbl);
    }
};
