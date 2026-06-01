<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UserLoginRequest;
use App\Services\AuthService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function userLogin(UserLoginRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $name = trim((string) $payload['name']);
        $email = strtolower(trim((string) $payload['email']));

        $result = $this->authService->upsertVisitor($name, $email);
        $user = $result['user'];
        $reservedAdminEmail = (bool) ($result['reserved_admin_email'] ?? false);

        if ($reservedAdminEmail || !$user) {
            return ApiResponse::error(
                message: 'This email is reserved for an admin account.',
                status: 422,
                data: []
            );
        }

        $token = $this->authService->issueToken(
            $user,
            'map-visitor',
            true,
            $this->authService->visitorTokenAbilities()
        );
        $userPayload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ];

        return ApiResponse::success(
            data: [
                'user_id' => $user->id,
                'token' => $token,
                'user' => $userPayload,
            ],
            message: 'User login successful.',
            extra: [
                // Preserve legacy fields consumed by old clients.
                'token' => $token,
                'user' => $userPayload,
            ]
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $password = (string) ($credentials['password'] ?? '');
        $login = trim((string) ($credentials['login'] ?? ''));
        $email = trim((string) ($credentials['email'] ?? ''));

        $user = $this->authService->attemptLogin($login, $email, $password);

        if (!$user) {
            return ApiResponse::error(
                message: 'Invalid credentials.',
                status: 422,
                errors: [
                    'login' => ['Login or password is incorrect.'],
                ],
                data: []
            );
        }

        $token = $this->authService->issueToken(
            $user,
            'nuxt-client',
            false,
            $this->authService->abilitiesForUser($user)
        );
        $userPayload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? null,
        ];

        return ApiResponse::success(
            data: [
                'token' => $token,
                'user' => $userPayload,
            ],
            message: 'Login successful.',
            extra: [
                // Preserve legacy fields consumed by old clients.
                'token' => $token,
                'user' => $userPayload,
            ]
        );
    }

    public function logout(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = request()->user();
        $user->currentAccessToken()?->delete();

        return ApiResponse::success(
            data: [],
            message: 'Logged out successfully.'
        );
    }

    public function me(): JsonResponse
    {
        return ApiResponse::success(
            data: request()->user(),
            message: 'Authenticated user profile.'
        );
    }
}
