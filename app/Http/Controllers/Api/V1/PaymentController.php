<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Payment\InitializeLateFeePaymentRequest;
use App\Http\Requests\Api\V1\Payment\VerifyPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Assessment;
use App\Models\AssessmentSubmission;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaymentController extends Controller
{
    public function __construct(
        public PaystackService $paystackService
    ) {}

    /**
     * Initialize Paystack late fee payment.
     */
    public function initializeLateFee(InitializeLateFeePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $assessment = Assessment::query()->findOrFail($validated['assessment_id']);

        $result = $this->paystackService->initializeLateFee(
            $request->user(),
            (float) $assessment->late_fee_amount,
            Assessment::class,
            $assessment->id,
            $validated['callback_url'] ?? null
        );

        return response()->json([
            'message' => 'Late fee payment initialized.',
            'data' => [
                'authorization_url' => $result['authorization_url'],
                'access_code' => $result['access_code'],
                'reference' => $result['reference'],
                'payment' => PaymentResource::make($result['payment']),
            ],
        ], Response::HTTP_CREATED);
    }

    /**
     * Verify Paystack payment transaction.
     */
    public function verify(VerifyPaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $payment = $this->paystackService->verifyPayment($validated['reference']);

        if ($payment->status === PaymentStatus::SUCCESS->value && $payment->payable_type === Assessment::class) {
            // Mark student submission late_fee_paid = true
            AssessmentSubmission::query()->updateOrCreate(
                [
                    'user_id' => $payment->user_id,
                    'assessment_id' => $payment->payable_id,
                ],
                [
                    'late_fee_paid' => true,
                    'submitted_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'Payment verification complete.',
            'data' => PaymentResource::make($payment),
        ]);
    }

    /**
     * Paystack Webhook listener.
     */
    public function webhook(Request $request): JsonResponse
    {
        $signature = $request->header('X-Paystack-Signature', '');
        $rawBody = $request->getContent();

        if (! $this->paystackService->verifyWebhookSignature($rawBody, $signature)) {
            return response()->json(['message' => 'Invalid webhook signature.'], Response::HTTP_UNAUTHORIZED);
        }

        $event = $request->input('event');
        if ($event === 'charge.success') {
            $reference = $request->input('data.reference');
            if ($reference) {
                $payment = $this->paystackService->verifyPayment($reference);
                if ($payment->payable_type === Assessment::class) {
                    AssessmentSubmission::query()->updateOrCreate(
                        [
                            'user_id' => $payment->user_id,
                            'assessment_id' => $payment->payable_id,
                        ],
                        [
                            'late_fee_paid' => true,
                            'submitted_at' => now(),
                        ]
                    );
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Get payment history for authenticated user.
     */
    public function history(Request $request): JsonResponse
    {
        $payments = \App\Models\Payment::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('limit', 15));

        return response()->json([
            'data' => PaymentResource::collection($payments),
            'payments' => PaymentResource::collection($payments),
            'total' => $payments->total(),
            'page' => $payments->currentPage(),
            'totalPages' => $payments->lastPage(),
        ]);
    }
}
