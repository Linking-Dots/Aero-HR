<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Perfect for small teams getting started with HR management',
                'price' => 29.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => [
                        'employee_management',
                        'time_tracking',
                        'basic_reporting'
                    ]
                ],
                'limits' => [
                    'employees' => 25,
                    'storage' => 5 * 1024 * 1024 * 1024, // 5GB in bytes
                    'api_calls' => 1000
                ],
                'stripe_price_id' => 'price_starter_monthly', // Replace with actual Stripe price IDs
                'stripe_monthly_price_id' => 'price_starter_monthly',
                'stripe_yearly_price_id' => 'price_starter_yearly',
                'is_active' => true,
                'trial_days' => 14,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Comprehensive HR solution for growing businesses',
                'price' => 79.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => [
                        'employee_management',
                        'time_tracking',
                        'payroll',
                        'performance_management',
                        'advanced_reporting',
                        'document_management'
                    ]
                ],
                'limits' => [
                    'employees' => 100,
                    'storage' => 25 * 1024 * 1024 * 1024, // 25GB in bytes
                    'api_calls' => 10000
                ],
                'stripe_price_id' => 'price_professional_monthly',
                'stripe_monthly_price_id' => 'price_professional_monthly',
                'stripe_yearly_price_id' => 'price_professional_yearly',
                'is_active' => true,
                'trial_days' => 14,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Full-featured platform for large organizations',
                'price' => 199.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => [
                        'all_modules'
                    ]
                ],
                'limits' => [
                    'employees' => null, // Unlimited
                    'storage' => null, // Unlimited
                    'api_calls' => null // Unlimited
                ],
                'stripe_price_id' => 'price_enterprise_monthly',
                'stripe_monthly_price_id' => 'price_enterprise_monthly',
                'stripe_yearly_price_id' => 'price_enterprise_yearly',
                'is_active' => true,
                'trial_days' => 30,
            ]
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }
    }
}
