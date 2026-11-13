<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $t->string('title');
            $t->unsignedBigInteger('amount_bdt')->default(0);
            $t->string('status', 12)->default('draft')->index(); // draft | sent | accepted | declined
            $t->text('notes')->nullable();
            $t->timestamps();
        });
        Schema::create('orders', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('quote_id')->nullable()->constrained()->nullOnDelete();
            $t->string('title');
            $t->unsignedBigInteger('amount_bdt')->default(0);
            $t->string('status', 14)->default('new')->index(); // new | in_progress | delivered | cancelled
            $t->timestamps();
        });
        Schema::create('projects', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('status', 14)->default('planning')->index(); // planning | in_progress | on_hold | completed
            $t->unsignedTinyInteger('progress')->default(0);
            $t->timestamps();
        });
        Schema::create('milestones', function (Blueprint $t) {
            $t->id();
            $t->foreignId('project_id')->constrained()->cascadeOnDelete();
            $t->string('title');
            $t->string('status', 16)->default('pending')->index(); // pending | in_progress | awaiting_client | completed
            $t->date('due_date')->nullable();
            $t->unsignedSmallInteger('sort')->default(0);
            $t->timestamp('approved_at')->nullable();
            $t->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $t->string('client_note', 500)->nullable();
            $t->timestamps();
        });
        Schema::create('files', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();       // the customer the file belongs to
            $t->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $t->string('name');
            $t->string('path');
            $t->unsignedBigInteger('size')->default(0);
            $t->string('mime', 100)->nullable();
            $t->timestamps();
        });
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->text('description')->nullable();
            $t->unsignedBigInteger('price_bdt')->default(0);
            $t->string('status', 12)->default('coming_soon'); // active | coming_soon | retired
            $t->timestamps();
        });
        Schema::create('licenses', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('product_id')->constrained()->cascadeOnDelete();
            $t->string('license_key', 64)->unique();
            $t->string('status', 10)->default('active'); // active | expired | revoked
            $t->date('expires_on')->nullable();
            $t->timestamps();
        });
        Schema::create('automation_runs', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('status', 20)->default('success')->index(); // success | failed | waiting_approval
            $t->text('log')->nullable();
            $t->timestamp('ran_at')->nullable();
            $t->timestamps();
        });
        Schema::create('cms_pages', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('title');
            $t->longText('body')->nullable();
            $t->string('status', 10)->default('draft'); // draft | published
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['cms_pages', 'automation_runs', 'licenses', 'products', 'files', 'milestones', 'projects', 'orders', 'quotes'] as $t) Schema::dropIfExists($t);
    }
};
