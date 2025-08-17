<?php

namespace Database\Seeders\Platform;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        // Create the three main plans
        Plan::factory()->starter()->create();
        Plan::factory()->professional()->create();
        Plan::factory()->enterprise()->create();

        // You can add Stripe product/price IDs here after creating them in Stripe
        // Example:
        /*
        Plan::where('slug', 'starter')->update([
            'stripe_product_id' => 'prod_starter123',
            'stripe_price_id_monthly' => 'price_starter_monthly123',
            'stripe_price_id_yearly' => 'price_starter_yearly123',
        ]);
        */
    }
}
