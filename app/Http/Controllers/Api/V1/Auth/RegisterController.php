<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthRegisterService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __construct(
        public AuthRegisterService $authRegisterService
    ) {}

    /**
     * Register a new user account.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $result = $this->authRegisterService->register($validated);

        return response()->json([
            'message' => 'User registered successfully.',
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'user' => UserResource::make($result['user']),
        ], 201);
    }
}
