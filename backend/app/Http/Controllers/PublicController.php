<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\PriceItem;
use App\Models\Service;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function services()
    {
        return Service::where('is_active', true)->orderBy('sort')->get();
    }

    public function prices()
    {
        return ['currency' => 'BDT', 'items' => PriceItem::where('is_active', true)->orderBy('sort')->get()];
    }

    /** Quote / contact request. Collects no payment. */
    public function lead(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:120', 'email' => 'nullable|email|max:190|required_without:phone',
            'phone' => 'nullable|string|max:20|required_without:email', 'company' => 'nullable|string|max:150',
            'interest' => 'nullable|string|max:150', 'message' => 'nullable|string|max:3000', 'locale' => 'nullable|in:bn,en',
        ]);
        Lead::create($d);
        return response()->json(['ok' => true], 201);
    }
}
