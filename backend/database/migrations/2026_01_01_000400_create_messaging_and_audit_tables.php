<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sms_templates', function (Blueprint $t) {
            $t->id();
            $t->string('key', 40)->unique();
            $t->string('name');
            $t->string('trigger_note')->nullable();
            $t->text('body_bn');
            $t->text('body_en');
            $t->boolean('transactional')->default(true);   // false = promotional, obeys quiet hours and opt-out
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('sms_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('to_masked', 20);
            $t->string('template_key', 40)->nullable()->index();
            $t->string('locale', 5)->default('bn');
            $t->string('status', 12)->default('queued')->index(); // queued | sent | delivered | failed
            $t->string('provider_message_id')->nullable()->index();
            $t->unsignedTinyInteger('attempts')->default(0);
            $t->string('error')->nullable();
            $t->timestamps();
        });

        Schema::create('settings', function (Blueprint $t) {
            $t->string('key')->primary();
            $t->longText('value')->nullable();               // encrypted when `secret` is true
            $t->boolean('secret')->default(false);
            $t->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $t->string('action', 60)->index();
            $t->string('subject_type', 60)->nullable();
            $t->unsignedBigInteger('subject_id')->nullable();
            $t->json('meta')->nullable();
            $t->string('ip', 45)->nullable();
            $t->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        foreach (['audit_logs','settings','sms_logs','sms_templates'] as $tbl) Schema::dropIfExists($tbl);
    }
};
