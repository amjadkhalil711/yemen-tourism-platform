<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Viewer accounts do not authenticate with passwords. Reusing an unknown
     * bcrypt hash avoids doing an expensive Hash::make call on every map unlock.
     */
    private const VISITOR_PASSWORD_HASH = '$2y$12$RhrcmSmSyFi9k3ygsNGmQeeEePBHb1I.GytrNkJ.baa7ZqpMk4rL2';

    /**
     * @return array<int, string>
     */
    public function adminTokenAbilities(): array
    {
        return [
            'session:read',
            'session:write',
            'stats:read',
            'content:read',
            'content:write',
            'map:view:track',
        ];
    }

    /**
     * @return array<int, string>
     */
    public function visitorTokenAbilities(): array
    {
        return [
            'session:read',
            'session:write',
            'map:view:track',
        ];
    }

    /**
     * @return array<int, string>
     */
    public function abilitiesForUser(User $user): array
    {
        if ($user->role === 'admin') {
            return $this->adminTokenAbilities();
        }

        if (str_starts_with((string) $user->role, 'admin_')) {
            if ($user->role === 'admin_visitors' || $user->role === 'admin_report') {
                return [
                    'session:read',
                    'session:write',
                    'stats:read',
                    'map:view:track',
                ];
            }
            return [
                'session:read',
                'session:write',
                'stats:read',
                'content:read',
                'content:write',
                'map:view:track',
            ];
        }

        return $this->visitorTokenAbilities();
    }

    public function attemptLogin(string $login, string $email, string $password): ?User
    {
        $user = $this->findByLoginOrEmail($login, $email);
        if (!$user) {
            return null;
        }

        if (!Hash::check($password, (string) $user->password)) {
            return null;
        }

        return $user;
    }

    /**
     * @return array{user: User|null, reserved_admin_email: bool}
     */
    public function upsertVisitor(string $name, string $email): array
    {
        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if ($user && (string) ($user->role ?? '') === 'admin') {
            return [
                'user' => null,
                'reserved_admin_email' => true,
            ];
        }

        if ($user) {
            $user->name = $name;
            $user->save();
        } else {
            $now = now();
            $userId = DB::table('users')->insertGetId([
                'name' => $name,
                'email' => $email,
                'password' => self::VISITOR_PASSWORD_HASH,
                'role' => 'viewer',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            /** @var User $user */
            $user = User::query()->findOrFail($userId);
        }

        return [
            'user' => $user,
            'reserved_admin_email' => false,
        ];
    }

    /**
     * @param  array<int, string>|null  $abilities
     */
    public function issueToken(User $user, string $tokenName, bool $singleTokenPerName = false, ?array $abilities = null): string
    {
        if ($singleTokenPerName) {
            $user->tokens()->where('name', $tokenName)->delete();
        }

        $resolvedAbilities = is_array($abilities) && $abilities !== []
            ? array_values(array_unique(array_filter($abilities, static fn ($ability): bool => is_string($ability) && trim($ability) !== '')))
            : ['*'];

        return $user->createToken($tokenName, $resolvedAbilities)->plainTextToken;
    }

    private function findByLoginOrEmail(string $login, string $email): ?User
    {
        $normalizedLogin = trim($login);
        if ($normalizedLogin !== '') {
            if (filter_var($normalizedLogin, FILTER_VALIDATE_EMAIL)) {
                $emailUser = $this->findByEmailValue($normalizedLogin);
                if ($emailUser) {
                    return $emailUser;
                }
            }

            return $this->findByNameValue($normalizedLogin);
        }

        $normalizedEmail = trim($email);
        if ($normalizedEmail !== '') {
            return $this->findByEmailValue($normalizedEmail);
        }

        return null;
    }

    private function findByEmailValue(string $email): ?User
    {
        return $this->findByCaseAwareField('email', $email);
    }

    private function findByNameValue(string $name): ?User
    {
        return $this->findByCaseAwareField('name', $name);
    }

    private function findByCaseAwareField(string $field, string $value): ?User
    {
        if (!in_array($field, ['email', 'name'], true)) {
            return null;
        }

        $normalizedValue = trim($value);
        if ($normalizedValue === '') {
            return null;
        }

        $lowercaseValue = strtolower($normalizedValue);

        $query = User::query()
            ->whereRaw("LOWER({$field}) = ?", [$lowercaseValue]);

        if ($lowercaseValue !== $normalizedValue) {
            $query->orderByRaw(
                "CASE WHEN {$field} = ? THEN 0 WHEN {$field} = ? THEN 1 ELSE 2 END",
                [$normalizedValue, $lowercaseValue]
            );
        } else {
            $query->orderByRaw(
                "CASE WHEN {$field} = ? THEN 0 ELSE 1 END",
                [$normalizedValue]
            );
        }

        /** @var User|null $user */
        $user = $query->first();

        return $user;
    }
}
