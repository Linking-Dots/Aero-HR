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
                'price_monthly' => 2900, // $29.00 in cents
                'price_yearly' => 29000, // $290.00 in cents (savings for yearly)
                'features' => [
                    'modules' => [
                        'employee_management',
                        'time_tracking',
                        'basic_reporting'
                    ]
                ],
                'max_users' => 25,
                'max_storage_gb' => 5,
                'stripe_price_id_monthly' => 'price_starter_monthly',
                'stripe_price_id_yearly' => 'price_starter_yearly',
                'stripe_product_id' => 'prod_starter',
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Advanced features for growing businesses and HR teams',
                'price_monthly' => 4900, // $49.00 in cents
                'price_yearly' => 49000, // $490.00 in cents (savings for yearly)
                'features' => [
                    'modules' => [
                        'employee_management',
                        'time_tracking',
                        'payroll',
                        'performance_management',
                        'advanced_reporting',
                        'leave_management'
                    ]
                ],
                'max_users' => 100,
                'max_storage_gb' => 20,
                'stripe_price_id_monthly' => 'price_professional_monthly',
                'stripe_price_id_yearly' => 'price_professional_yearly',
                'stripe_product_id' => 'prod_professional',
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Complete HR solution for large organizations',
                'price_monthly' => 9900, // $99.00 in cents
                'price_yearly' => 99000, // $990.00 in cents (savings for yearly)
                'features' => [
                    'modules' => [
                        'employee_management',
                        'time_tracking',
                        'payroll',
                        'performance_management',
                        'advanced_reporting',
                        'leave_management',
                        'recruitment',
                        'training_management',
                        'compliance_management'
                    ]
                ],
                'max_users' => null, // Unlimited
                'max_storage_gb' => 100,
                'stripe_price_id_monthly' => 'price_enterprise_monthly',
                'stripe_price_id_yearly' => 'price_enterprise_yearly',
                'stripe_product_id' => 'prod_enterprise',
                'is_active' => true,
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
