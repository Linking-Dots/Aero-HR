<?php

namespace Database\Factories;

use App\Models\PlatformUser;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PlatformUserFactory extends Factory
{
    protected $model = PlatformUser::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => $this->faker->randomElement(['support', 'billing']),
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }

    public function superAdmin(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Super Admin',
                'email' => 'admin@mysoftwaredomain.com',
                'role' => 'super_admin',
            ];
        });
    }

    public function support(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'support',
            ];
        });
    }

    public function billing(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'billing',
            ];
        });
    }

    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    public function unverified(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null,
            ];
        });
    }
}
