<?php
// database/seeders/PlansSeeder.php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
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
                'price' => 29.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => ['hr', 'attendance', 'leave', 'basic_reports'],
                    'storage' => '5GB',
                    'support' => 'Email support',
                    'integrations' => 'Basic API access',
                    'users' => 'Up to 10 employees'
                ],
                'limits' => [
                    'max_employees' => 10,
                    'max_storage_gb' => 5,
                    'api_calls_per_month' => 1000,
                    'max_departments' => 5,
                    'max_projects' => 10
                ],
                'stripe_price_id' => 'price_starter_monthly', // Replace with actual Stripe price ID
                'is_active' => true,
                'trial_days' => 14
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'price' => 79.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => ['hr', 'attendance', 'leave', 'payroll', 'performance', 'recruitment', 'advanced_reports'],
                    'storage' => '25GB',
                    'support' => 'Priority email & chat support',
                    'integrations' => 'Full API access + webhooks',
                    'users' => 'Up to 50 employees',
                    'advanced_features' => 'Custom fields, workflows'
                ],
                'limits' => [
                    'max_employees' => 50,
                    'max_storage_gb' => 25,
                    'api_calls_per_month' => 10000,
                    'max_departments' => 20,
                    'max_projects' => 50,
                    'custom_fields' => true
                ],
                'stripe_price_id' => 'price_professional_monthly', // Replace with actual Stripe price ID
                'is_active' => true,
                'trial_days' => 14
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'price' => 199.00,
                'billing_cycle' => 'monthly',
                'features' => [
                    'modules' => ['all_modules'],
                    'storage' => '100GB',
                    'support' => '24/7 phone & email support',
                    'integrations' => 'Enterprise API + custom integrations',
                    'users' => 'Unlimited employees',
                    'advanced_features' => 'White-label, SSO, advanced security',
                    'dedicated_support' => 'Dedicated account manager'
                ],
                'limits' => [
                    'max_employees' => null, // unlimited
                    'max_storage_gb' => 100,
                    'api_calls_per_month' => 100000,
                    'max_departments' => null,
                    'max_projects' => null,
                    'custom_fields' => true,
                    'white_label' => true,
                    'sso' => true
                ],
                'stripe_price_id' => 'price_enterprise_monthly', // Replace with actual Stripe price ID
                'is_active' => true,
                'trial_days' => 30 // Longer trial for enterprise
            ],
            // Yearly plans with discounts
            [
                'name' => 'Starter',
                'slug' => 'starter-yearly',
                'price' => 290.00, // ~17% discount
                'billing_cycle' => 'yearly',
                'features' => [
                    'modules' => ['hr', 'attendance', 'leave', 'basic_reports'],
                    'storage' => '5GB',
                    'support' => 'Email support',
                    'integrations' => 'Basic API access',
                    'users' => 'Up to 10 employees',
                    'savings' => '2 months free'
                ],
                'limits' => [
                    'max_employees' => 10,
                    'max_storage_gb' => 5,
                    'api_calls_per_month' => 1000,
                    'max_departments' => 5,
                    'max_projects' => 10
                ],
                'stripe_price_id' => 'price_starter_yearly',
                'is_active' => true,
                'trial_days' => 14
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional-yearly',
                'price' => 790.00, // ~17% discount
                'billing_cycle' => 'yearly',
                'features' => [
                    'modules' => ['hr', 'attendance', 'leave', 'payroll', 'performance', 'recruitment', 'advanced_reports'],
                    'storage' => '25GB',
                    'support' => 'Priority email & chat support',
                    'integrations' => 'Full API access + webhooks',
                    'users' => 'Up to 50 employees',
                    'advanced_features' => 'Custom fields, workflows',
                    'savings' => '2 months free'
                ],
                'limits' => [
                    'max_employees' => 50,
                    'max_storage_gb' => 25,
                    'api_calls_per_month' => 10000,
                    'max_departments' => 20,
                    'max_projects' => 50,
                    'custom_fields' => true
                ],
                'stripe_price_id' => 'price_professional_yearly',
                'is_active' => true,
                'trial_days' => 14
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise-yearly',
                'price' => 1990.00, // ~17% discount
                'billing_cycle' => 'yearly',
                'features' => [
                    'modules' => ['all_modules'],
                    'storage' => '100GB',
                    'support' => '24/7 phone & email support',
                    'integrations' => 'Enterprise API + custom integrations',
                    'users' => 'Unlimited employees',
                    'advanced_features' => 'White-label, SSO, advanced security',
                    'dedicated_support' => 'Dedicated account manager',
                    'savings' => '2 months free'
                ],
                'limits' => [
                    'max_employees' => null,
                    'max_storage_gb' => 100,
                    'api_calls_per_month' => 100000,
                    'max_departments' => null,
                    'max_projects' => null,
                    'custom_fields' => true,
                    'white_label' => true,
                    'sso' => true
                ],
                'stripe_price_id' => 'price_enterprise_yearly',
                'is_active' => true,
                'trial_days' => 30
            ]
        ];

        foreach ($plans as $planData) {
            Plan::firstOrCreate(
                [
                    'name' => $planData['name'],
                    'billing_cycle' => $planData['billing_cycle']
                ],
                $planData
            );
        }

        $this->command->info('✅ SaaS plans created successfully!');
        $this->command->table(
            ['Plan', 'Price', 'Billing', 'Max Employees', 'Storage'],
            collect($plans)->map(function ($plan) {
                return [
                    $plan['name'],
                    '$' . $plan['price'],
                    ucfirst($plan['billing_cycle']),
                    $plan['limits']['max_employees'] ?? 'Unlimited',
                    $plan['features']['storage']
                ];
            })->toArray()
        );
    }
}
