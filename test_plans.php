<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get plans like the controller does
$basePlans = App\Models\Plan::where('is_active', true)
    ->orderBy('price_monthly')
    ->get();

// Transform plans to include monthly and yearly variants
$plans = collect();

foreach ($basePlans as $plan) {
    // Monthly plan
    $plans->push([
        'id' => $plan->id,
        'name' => $plan->name,
        'slug' => $plan->slug,
        'description' => $plan->description,
        'price' => $plan->price_monthly / 100, // Convert cents to dollars
        'billing_cycle' => 'monthly',
        'features' => $plan->features,
        'max_users' => $plan->max_users,
        'max_storage_gb' => $plan->max_storage_gb,
        'is_featured' => $plan->is_featured,
        'stripe_price_id' => $plan->stripe_price_id_monthly,
    ]);
    
    // Yearly plan
    $plans->push([
        'id' => $plan->id . '_yearly', // Unique ID for yearly variant
        'base_plan_id' => $plan->id, // Reference to base plan
        'name' => $plan->name,
        'slug' => $plan->slug,
        'description' => $plan->description,
        'price' => $plan->price_yearly / 100, // Convert cents to dollars
        'billing_cycle' => 'yearly',
        'features' => $plan->features,
        'max_users' => $plan->max_users,
        'max_storage_gb' => $plan->max_storage_gb,
        'is_featured' => $plan->is_featured,
        'stripe_price_id' => $plan->stripe_price_id_yearly,
    ]);
}

echo "Total plans: " . $plans->count() . "\n\n";

foreach ($plans as $plan) {
    echo sprintf(
        "ID: %s, Name: %s, Cycle: %s, Price: $%.2f\n",
        $plan['id'],
        $plan['name'],
        $plan['billing_cycle'],
        $plan['price']
    );
}

echo "\n--- Monthly Plans ---\n";
$monthlyPlans = $plans->filter(function($p) { return $p['billing_cycle'] === 'monthly'; });
foreach ($monthlyPlans as $plan) {
    echo sprintf("ID: %s, Name: %s, Price: $%.2f\n", $plan['id'], $plan['name'], $plan['price']);
}

echo "\n--- Yearly Plans ---\n";
$yearlyPlans = $plans->filter(function($p) { return $p['billing_cycle'] === 'yearly'; });
foreach ($yearlyPlans as $plan) {
    echo sprintf("ID: %s, Name: %s, Price: $%.2f\n", $plan['id'], $plan['name'], $plan['price']);
}
