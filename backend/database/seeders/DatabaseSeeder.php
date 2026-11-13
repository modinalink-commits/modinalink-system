<?php

namespace Database\Seeders;

use App\Models\GatewayConfig;
use App\Models\PriceItem;
use App\Models\Service;
use App\Models\SmsTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // First admin comes from .env. Change the password after the first login.
        if (env('ADMIN_EMAIL') && env('ADMIN_PASSWORD')) {
            User::updateOrCreate(['email' => env('ADMIN_EMAIL')], ['name' => 'Admin', 'password' => env('ADMIN_PASSWORD'), 'role' => 'admin', 'locale' => 'bn']);
        }

        foreach (GatewayConfig::GATEWAYS as $g) {
            GatewayConfig::firstOrCreate(['gateway' => $g], ['enabled' => false, 'mode' => 'sandbox']);
        }

        $services = [
            ['web', 'ওয়েবসাইট ও ওয়েব অ্যাপ', 'Websites & web apps', 'কোম্পানি সাইট, ই-কমার্স, কাস্টম ওয়েব অ্যাপ।', 'Company sites, e-commerce and custom web apps.'],
            ['software', 'কাস্টম সফটওয়্যার', 'Custom software', 'আপনার প্রক্রিয়া অনুযায়ী তৈরি সফটওয়্যার।', 'Software built around your process.'],
            ['mobile', 'মোবাইল অ্যাপ', 'Mobile apps', 'অ্যান্ড্রয়েড ও আইওএস অ্যাপ।', 'Android and iOS apps.'],
            ['hosting', 'হোস্টিং ও ডোমেইন', 'Hosting & domains', 'হোস্টিং, ডোমেইন, SSL ও ব্যাকআপ।', 'Hosting, domains, SSL and backups.'],
            ['support', 'আইটি সাপোর্ট', 'IT support', 'রক্ষণাবেক্ষণ ও দ্রুত সহায়তা।', 'Maintenance and quick help.'],
        ];
        foreach ($services as $i => [$slug, $tb, $te, $sb, $se]) {
            Service::updateOrCreate(['slug' => $slug], ['category' => $slug, 'title_bn' => $tb, 'title_en' => $te, 'summary_bn' => $sb, 'summary_en' => $se, 'sort' => $i]);
        }

        // Price items are NOT seeded with invented numbers: add real ones from the admin panel.
        // (PriceItem import left to the owner so no unverified price is published.)

        $tpl = [
            ['ticket_created', 'টিকিট তৈরি', 'টিকিট জমা হলে', 'আপনার অনুরোধ {ticket} পেয়েছি। আমাদের টিম দেখছে। — ModinaLink', 'We received your request {ticket}. Our team is reviewing it. — ModinaLink', true],
            ['ticket_updated', 'টিকিট আপডেট', 'স্ট্যাটাস বদলালে', '{ticket} আপডেট হয়েছে। বিস্তারিত: {link}', '{ticket} was updated. Details: {link}', true],
            ['preview_ready', 'প্রিভিউ প্রস্তুত', 'স্টেজিং প্রস্তুত হলে', '{ticket}-এর প্রিভিউ দেখার জন্য প্রস্তুত: {link}', 'The preview for {ticket} is ready: {link}', true],
            ['invoice_issued', 'ইনভয়েস', 'ইনভয়েস ইস্যু হলে', 'নতুন ইনভয়েস ৳{amount}, শেষ তারিখ {due_date}। {link}', 'New invoice ৳{amount}, due {due_date}. {link}', true],
            ['payment_received', 'পেমেন্ট পেয়েছি', 'পেমেন্ট নিশ্চিত হলে', '৳{amount} পেমেন্ট পেয়েছি। ধন্যবাদ। — ModinaLink', 'We received your payment of ৳{amount}. Thank you. — ModinaLink', true],
            ['renewal_reminder', 'নবায়ন রিমাইন্ডার', 'নবায়নের আগে', 'আপনার সেবা {due_date} তারিখে নবায়ন হবে। {link}', 'Your service renews on {due_date}. {link}', true],
        ];
        foreach ($tpl as [$key, $name, $note, $bn, $en, $tx]) {
            SmsTemplate::firstOrCreate(['key' => $key], ['name' => $name, 'trigger_note' => $note, 'body_bn' => $bn, 'body_en' => $en, 'transactional' => $tx, 'is_active' => true]);
        }
    }
}
