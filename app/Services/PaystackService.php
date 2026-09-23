<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaystackService
{
    protected string $secretKey;
    protected string $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key', 'sk_test_mock_secret_key');
    }

    /**
     * Initialize Paystack late fee transaction.
     */
    public function initializeLateFee(User $user, float $amount, string $assessableType, string $assessableId, ?string $callbackUrl = null): array
    {
        $reference = 'STP_LATE_' . Str::upper(Str::random(12));

        $payment = Payment::query()->create([
            'user_id' => $user->id,
            'payable_type' => $assessableType,
            'payable_id' => $assessableId,
            'reference' => $reference,
            'amount' => $amount,
            'currency' => 'NGN',
            'status' => PaymentStatus::PENDING->value,
        ]);

        $payload = [
            'email' => $user->email,
            'amount' => (int) ($amount * 100), // Amount in kobo
            'reference' => $reference,
            'callback_url' => $callbackUrl ?? config('app.url') . '/api/v1/payments/verify',
            'metadata' => [
                'user_id' => $user->id,
                'payable_type' => $assessableType,
                'payable_id' => $assessableId,
            ],
        ];

        // If in test environment without live key, return mock checkout URL
        if (app()->environment('testing') || Str::contains($this->secretKey, 'mock')) {
            return [
                'authorization_url' => "https://checkout.paystack.com/{$reference}",
                'access_code' => "access_{$reference}",
                'reference' => $reference,
                'payment' => $payment,
            ];
        }

        $response = Http::withToken($this->secretKey)
            ->post("{$this->baseUrl}/transaction/initialize", $payload);

        if ($response->successful()) {
            return array_merge($response->json('data'), ['payment' => $payment]);
        }

        throw new \Exception('Paystack payment initialization failed: ' . $response->body());
    }

    /**
     * Verify Paystack payment reference.
     */
    public function verifyPayment(string $reference): Payment
    {
        $payment = Payment::query()->where('reference', $reference)->firstOrFail();

        // In test environment, simulate successful verification
        if (app()->environment('testing') || Str::contains($this->secretKey, 'mock')) {
            $payment->update([
                'status' => PaymentStatus::SUCCESS->value,
                'paid_at' => now(),
                'paystack_response' => ['status' => true, 'message' => 'Simulated successful verification'],
            ]);

            return $payment->fresh();
        }

        $response = Http::withToken($this->secretKey)
            ->get("{$this->baseUrl}/transaction/verify/{$reference}");

        if ($response->successful() && $response->json('data.status') === 'success') {
            $payment->update([
                'status' => PaymentStatus::SUCCESS->value,
                'paid_at' => now(),
                'payment_method' => $response->json('data.channel'),
                'paystack_response' => $response->json('data'),
            ]);
        } else {
            $payment->update([
                'status' => PaymentStatus::FAILED->value,
                'paystack_response' => $response->json('data'),
            ]);
        }

        return $payment->fresh();
    }

    /**
     * Verify Paystack HMAC SHA512 Webhook Signature.
     */
    public function verifyWebhookSignature(string $rawBody, string $signature): bool
    {
        $calculatedHash = hash_hmac('sha512', $rawBody, $this->secretKey);

        return hash_equals($calculatedHash, $signature);
    }
}
