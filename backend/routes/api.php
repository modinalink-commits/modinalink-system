<?php

use App\Http\Controllers\Admin\BillingAdminController;
use App\Http\Controllers\Admin\IntegrationController;
use App\Http\Controllers\Admin\ManageController;
use App\Http\Controllers\Admin\TicketAdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\Webhooks\WebhookController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/services', [PublicController::class, 'services']);
Route::get('/prices', [PublicController::class, 'prices']);
Route::post('/leads', [PublicController::class, 'lead'])->middleware('throttle:public-form');

Route::middleware('throttle:auth')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

// Gateway and SMS callbacks (verified server-side inside the handlers)
Route::middleware('throttle:webhook')->group(function () {
    Route::match(['get', 'post'], '/webhooks/payment/{gateway}', [WebhookController::class, 'payment']);
    Route::match(['get', 'post'], '/webhooks/sms', [WebhookController::class, 'smsDlr']);
});

// Signed-in users
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateMe']);
    Route::post('/me/otp/send', [AuthController::class, 'sendOtp'])->middleware('throttle:otp');
    Route::post('/me/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:otp');

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets/{id}/messages', [TicketController::class, 'message']);

    Route::get('/invoices', [BillingController::class, 'invoices']);
    Route::get('/invoices/{id}', [BillingController::class, 'invoice']);
    Route::get('/payment-methods', [BillingController::class, 'methods']);
    Route::post('/invoices/{id}/pay', [BillingController::class, 'pay']);
    Route::post('/payments/{id}/bank-proof', [BillingController::class, 'bankProof']);
    Route::get('/subscriptions', [BillingController::class, 'subscriptions']);
    Route::get('/me/grants', [BillingController::class, 'grants']);

    // Staff and admin
    Route::prefix('admin')->middleware('role:staff,admin')->group(function () {
        Route::get('/tickets', [TicketAdminController::class, 'index']);
        Route::get('/tickets/{id}', [TicketAdminController::class, 'show']);
        Route::post('/tickets/{id}/transition', [TicketAdminController::class, 'transition']);
        Route::post('/tickets/{id}/messages', [TicketAdminController::class, 'message']);
        Route::post('/tickets/{id}/assign', [TicketAdminController::class, 'assign']);

        Route::get('/invoices', [BillingAdminController::class, 'invoices']);
        Route::post('/invoices', [BillingAdminController::class, 'createInvoice']);
        Route::post('/invoices/{id}/issue', [BillingAdminController::class, 'issue']);
        Route::post('/invoices/{id}/void', [BillingAdminController::class, 'void']);
        Route::get('/payments', [BillingAdminController::class, 'payments']);
        Route::post('/payments/{id}/verify', [BillingAdminController::class, 'verifyPayment']);
        Route::post('/payments/{id}/reject', [BillingAdminController::class, 'rejectPayment']);
        Route::get('/subscriptions', [BillingAdminController::class, 'subscriptions']);
        Route::post('/subscriptions', [BillingAdminController::class, 'createSubscription']);

        Route::get('/users', [ManageController::class, 'users']);
        Route::post('/users/{id}/grant', [ManageController::class, 'grant']);
        Route::get('/leads', [ManageController::class, 'leads']);
        Route::patch('/leads/{id}', [ManageController::class, 'updateLead']);
        Route::post('/prices', [ManageController::class, 'savePrice']);
        Route::put('/prices/{id}', [ManageController::class, 'savePrice']);
    });

    // Admin only: integrations, roles, audit
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/gateways', [IntegrationController::class, 'gateways']);
        Route::put('/gateways/{gateway}', [IntegrationController::class, 'updateGateway']);
        Route::get('/sms/provider', [IntegrationController::class, 'smsProvider']);
        Route::put('/sms/provider', [IntegrationController::class, 'updateSmsProvider']);
        Route::get('/sms/templates', [IntegrationController::class, 'templates']);
        Route::put('/sms/templates/{key}', [IntegrationController::class, 'updateTemplate']);
        Route::post('/sms/test', [IntegrationController::class, 'testSms']);
        Route::get('/sms/logs', [IntegrationController::class, 'smsLogs']);
        Route::post('/users/{id}/role', [ManageController::class, 'setRole']);
        Route::get('/audit', [ManageController::class, 'audit']);
    });
});
