<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = User::where('role', 'like', 'admin%')
            ->orderBy('id', 'desc')
            ->get();

        return ApiResponse::success(
            data: $admins->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at?->toIso8601String(),
            ])->toArray(),
            message: 'Admin list loaded.'
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in([
                'admin',
                'admin_cities',
                'admin_landmarks',
                'admin_visitors',
                'admin_report',
                'admin_messages'
            ])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return ApiResponse::success(
            data: [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            message: 'Admin created successfully.',
            status: 201
        );
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return ApiResponse::error(
                message: 'You cannot delete your own admin account.',
                status: 400
            );
        }

        if ($user->role === 'admin' && $request->user()->role !== 'admin') {
            return ApiResponse::error(
                message: 'Unauthorized.',
                status: 403
            );
        }

        $user->delete();

        return ApiResponse::deleted('Admin deleted successfully.');
    }
}
