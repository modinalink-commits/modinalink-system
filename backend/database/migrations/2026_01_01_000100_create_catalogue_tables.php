<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Public catalogue content. Every text exists in Bengali and English.
        Schema::create('services', function (Blueprint $t) {
            $t->id();
            $t->string('slug')->unique();
            $t->string('category', 40)->index();
            $t->string('title_bn');
            $t->string('title_en');
            $t->text('summary_bn')->nullable();
            $t->text('summary_en')->nullable();
            $t->boolean('is_active')->default(true);
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        // Indicative price list, BDT only. Admin edits these.
        Schema::create('price_items', function (Blueprint $t) {
            $t->id();
            $t->string('group_bn');
            $t->string('group_en');
            $t->string('name_bn');
            $t->string('name_en');
            $t->string('billing', 20);                 // yearly | monthly | one_time | project | hourly | per_unit
            $t->unsignedBigInteger('min_bdt')->nullable();
            $t->unsignedBigInteger('max_bdt')->nullable();
            $t->string('basis', 10)->default('estimate'); // market | estimate
            $t->boolean('is_active')->default(true);
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        Schema::create('leads', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email')->nullable();
            $t->string('phone', 20)->nullable();
            $t->string('company')->nullable();
            $t->string('interest')->nullable();
            $t->text('message')->nullable();
            $t->string('locale', 5)->default('bn');
            $t->string('status', 20)->default('new');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['leads','price_items','services'] as $tbl) Schema::dropIfExists($tbl);
    }
};
