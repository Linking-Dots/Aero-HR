<?php

namespace Database\Factories;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFactory extends Factory
{
    protected $model = Plan::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'slug' => $this->faker->unique()->slug(2),
            'description' => $this->faker->sentence(),
            'price_monthly' => $this->faker->randomElement([999, 1999, 4999, 9999]), // in cents
            'price_yearly' => function (array $attributes) {
                return $attributes['price_monthly'] * 10; // 2 months free
            },
            'features' => [
                'unlimited_users',
                'email_support',
                'basic_analytics',
            ],
            'max_users' => $this->faker->randomElement([10, 50, 100, null]),
            'max_storage_gb' => $this->faker->randomElement([10, 50, 100, null]),
            'custom_domain' => $this->faker->boolean(30),
            'api_access' => $this->faker->boolean(50),
            'priority_support' => $this->faker->boolean(20),
            'is_active' => true,
            'is_featured' => $this->faker->boolean(20),
            'sort_order' => $this->faker->numberBetween(1, 10),
        ];
    }

    public function starter(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Perfect for small teams getting started',
                'price_monthly' => 999, // $9.99
                'price_yearly' => 9990, // $99.90 (2 months free)
                'features' => [
                    'up_to_10_users',
                    'email_support',
                    'basic_analytics',
                ],
                'max_users' => 10,
                'max_storage_gb' => 10,
                'custom_domain' => false,
                'api_access' => false,
                'priority_support' => false,
                'sort_order' => 1,
            ];
        });
    }

    public function professional(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'For growing businesses that need more features',
                'price_monthly' => 2999, // $29.99
                'price_yearly' => 29990, // $299.90 (2 months free)
                'features' => [
                    'up_to_50_users',
                    'priority_support',
                    'advanced_analytics',
                    'api_access',
                ],
                'max_users' => 50,
                'max_storage_gb' => 50,
                'custom_domain' => true,
                'api_access' => true,
                'priority_support' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ];
        });
    }

    public function enterprise(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For large organizations with unlimited needs',
                'price_monthly' => 9999, // $99.99
                'price_yearly' => 99990, // $999.90 (2 months free)
                'features' => [
                    'unlimited_users',
                    'priority_support',
                    'advanced_analytics',
                    'api_access',
                    'custom_integrations',
                    'sso',
                ],
                'max_users' => null,
                'max_storage_gb' => null,
                'custom_domain' => true,
                'api_access' => true,
                'priority_support' => true,
                'sort_order' => 3,
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
}
