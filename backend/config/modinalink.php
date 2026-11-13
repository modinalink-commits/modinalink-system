<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'currency' => 'BDT', // single currency for now; add more later
    'reminder_days' => [30, 15, 7, 1],
    'otp' => [
        'ttl_minutes' => 5,
        'max_attempts' => 5,
        'max_sends_per_hour' => 5,
    ],
    'sms' => [
        // Quiet hours apply to non-transactional (promotional) messages only.
        'quiet_from' => env('SMS_QUIET_FROM', '22:00'),
        'quiet_to' => env('SMS_QUIET_TO', '08:00'),
        'timezone' => env('APP_TIMEZONE', 'Asia/Dhaka'),
    ],
    'disclosure' => [
        'bn' => 'ModinaLink টিম। কিছু খসড়া কাজে এআই সহায়তা নেওয়া হয়, প্রতিটি পরিবর্তন আমাদের স্টাফ যাচাই করে অনুমোদন দেয়।',
        'en' => 'ModinaLink Team. AI assists with some drafts; every change is reviewed and approved by our staff.',
    ],
];
