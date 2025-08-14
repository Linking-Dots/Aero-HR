# 🚀 Multi-Tenant SaaS Implementation Starter Guide

**Phase 1: Foundation Setup - Ready-to-implement code and configurations**

---

## 📦 Required Package Installation

```bash
# Core multi-tenancy package
composer require stancl/tenancy

# Additional packages for complete SaaS functionality
composer require stripe/stripe-php
composer require laravel/cashier-stripe
composer require spatie/laravel-activitylog
composer require doctrine/dbal

# Frontend packages
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install recharts
npm install react-hot-toast
```

---

## 🗄️ Database Migrations - Central Platform

### 1. Create Central Database Migrations

```php
<?php
// database/migrations/central/2025_01_01_000001_create_tenants_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('domain')->unique()->nullable();
            $table->string('database_name');
            $table->foreignId('plan_id')->constrained('plans');
            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
            $table->timestamp('trial_ends_at')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'trial_ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
```

```php
<?php
// database/migrations/central/2025_01_01_000002_create_plans_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly']);
            $table->json('features');
            $table->json('limits');
            $table->string('stripe_price_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(14);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
```

```php
<?php
// database/migrations/central/2025_01_01_000003_create_subscriptions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('plans');
            $table->string('stripe_subscription_id')->nullable();
            $table->enum('status', ['active', 'trialing', 'past_due', 'cancelled', 'expired']);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
```

---

## 🏗️ Core Models

### 1. Tenant Model

```php
<?php
// app/Models/Tenant.php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;

    protected $fillable = [
        'id', 'name', 'slug', 'domain', 'database_name', 
        'plan_id', 'status', 'trial_ends_at', 'settings'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'settings' => 'array'
    ];

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug', 
            'domain',
            'database_name',
            'plan_id',
            'status',
            'trial_ends_at',
            'settings'
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription && 
               in_array($this->subscription->status, ['active', 'trialing']);
    }
}
```

### 2. Plan Model

```php
<?php
// app/Models/Plan.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'price', 'billing_cycle', 
        'features', 'limits', 'stripe_price_id', 
        'is_active', 'trial_days'
    ];

    protected $casts = [
        'features' => 'array',
        'limits' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean'
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features['modules'] ?? []);
    }

    public function getLimit(string $limit): ?int
    {
        return $this->limits[$limit] ?? null;
    }
}
```

### 3. Subscription Model

```php
<?php
// app/Models/Subscription.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id', 'plan_id', 'stripe_subscription_id',
        'status', 'trial_ends_at', 'ends_at', 'auto_renew'
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at' => 'datetime',
        'auto_renew' => 'boolean'
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trialing']);
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trialing' && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }

    public function hasExpired(): bool
    {
        return $this->ends_at && $this->ends_at->isPast();
    }
}
```

---

## ⚙️ Configuration Files

### 1. Tenancy Configuration

```php
<?php
// config/tenancy.php

return [
    'tenant_model' => \App\Models\Tenant::class,
    'id_generator' => \Stancl\Tenancy\UUIDGenerator::class,

    'domain_model' => \Stancl\Tenancy\Database\Models\Domain::class,

    'central_domains' => [
        'localhost',
        '127.0.0.1',
        env('CENTRAL_DOMAIN', 'aero-hr.com'),
    ],

    'database' => [
        'central_connection' => env('DB_CONNECTION', 'mysql'),
        'template_tenant_connection' => null,
        'tenant_connection_name' => 'tenant',
        'managers' => [
            'sqlite' => \Stancl\Tenancy\Database\DatabaseManager::class,
            'mysql' => \Stancl\Tenancy\Database\DatabaseManager::class,
            'pgsql' => \Stancl\Tenancy\Database\DatabaseManager::class,
        ],
    ],

    'cache' => [
        'tag_base' => 'tenant',
    ],

    'filesystem' => [
        'suffix_base' => 'tenant',
    ],

    'redis' => [
        'prefix_base' => 'tenant',
    ],

    'features' => [
        \Stancl\Tenancy\Features\TenantConfig::class,
        \Stancl\Tenancy\Features\UniversalRoutes::class,
        \Stancl\Tenancy\Features\TelescopeTags::class,
    ],

    'migration_parameters' => [
        '--force' => true,
        '--realpath' => true,
    ],

    'seeder_parameters' => [
        '--force' => true,
    ],
];
```

### 2. Database Configuration Update

```php
<?php
// config/database.php - Add tenant connection

'connections' => [
    // Existing connections...
    
    'tenant' => [
        'driver' => 'mysql',
        'url' => env('DATABASE_URL'),
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => null, // Will be set dynamically
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        'unix_socket' => env('DB_SOCKET', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => true,
        'engine' => null,
        'options' => extension_loaded('pdo_mysql') ? array_filter([
            PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
        ]) : [],
    ],
];
```

---

## 🛣️ Route Configuration

### 1. Tenant Routes

```php
<?php
// routes/tenant.php

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    
    // Include existing authenticated routes for tenants
    require __DIR__.'/web.php';
    
    // Tenant-specific routes
    Route::get('/subscription', [App\Http\Controllers\Tenant\SubscriptionController::class, 'show'])
        ->name('subscription.show');
    
    Route::post('/subscription/upgrade', [App\Http\Controllers\Tenant\SubscriptionController::class, 'upgrade'])
        ->name('subscription.upgrade');
        
    Route::post('/subscription/cancel', [App\Http\Controllers\Tenant\SubscriptionController::class, 'cancel'])
        ->name('subscription.cancel');
});
```

### 2. Central Routes (Landing & Registration)

```php
<?php
// routes/central.php

use Illuminate\Support\Facades\Route;

// Landing page routes
Route::get('/', [App\Http\Controllers\LandingController::class, 'index'])->name('home');
Route::get('/pricing', [App\Http\Controllers\LandingController::class, 'pricing'])->name('pricing');
Route::get('/features', [App\Http\Controllers\LandingController::class, 'features'])->name('features');

// Registration flow
Route::get('/register', [App\Http\Controllers\TenantRegistrationController::class, 'showPlans'])
    ->name('register');
    
Route::get('/register/{plan}', [App\Http\Controllers\TenantRegistrationController::class, 'showRegistration'])
    ->name('register.plan');
    
Route::post('/register', [App\Http\Controllers\TenantRegistrationController::class, 'register'])
    ->name('register.store');

// Stripe webhooks
Route::post('/stripe/webhook', [App\Http\Controllers\StripeWebhookController::class, 'handleWebhook'])
    ->name('stripe.webhook');
```

---

## 🎛️ Controllers

### 1. Tenant Registration Controller

```php
<?php
// app/Http/Controllers/TenantRegistrationController.php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use App\Services\TenantService;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TenantRegistrationController extends Controller
{
    public function __construct(
        private TenantService $tenantService,
        private BillingService $billingService
    ) {}

    public function showPlans()
    {
        $plans = Plan::where('is_active', true)->get();
        
        return Inertia::render('Landing/SelectPlan', [
            'plans' => $plans
        ]);
    }

    public function showRegistration(Plan $plan)
    {
        return Inertia::render('Landing/Register', [
            'plan' => $plan
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'company_name' => 'required|string|max:255',
            'company_domain' => 'required|string|unique:tenants,domain',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:tenant_users,email',
            'owner_password' => 'required|string|min:8',
            'payment_method_id' => 'required|string'
        ]);

        DB::beginTransaction();

        try {
            // Create tenant
            $tenant = $this->tenantService->createTenant([
                'name' => $validated['company_name'],
                'domain' => $validated['company_domain'],
                'plan_id' => $validated['plan_id']
            ]);

            // Process payment and create subscription
            $subscription = $this->billingService->createSubscription(
                $tenant,
                Plan::find($validated['plan_id']),
                $validated['payment_method_id']
            );

            // Create tenant owner
            $owner = $this->tenantService->createTenantOwner($tenant, [
                'name' => $validated['owner_name'],
                'email' => $validated['owner_email'],
                'password' => $validated['owner_password']
            ]);

            DB::commit();

            // Redirect to tenant domain
            return redirect("http://{$tenant->domain}.aero-hr.com/dashboard")
                ->with('success', 'Account created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors([
                'general' => 'Failed to create account: ' . $e->getMessage()
            ]);
        }
    }
}
```

### 2. Landing Controller

```php
<?php
// app/Http/Controllers/LandingController.php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        return Inertia::render('Landing/Home');
    }

    public function pricing()
    {
        $plans = Plan::where('is_active', true)->get();
        
        return Inertia::render('Landing/Pricing', [
            'plans' => $plans
        ]);
    }

    public function features()
    {
        return Inertia::render('Landing/Features');
    }
}
```

---

## 🔧 Services

### 1. Tenant Service

```php
<?php
// app/Services/TenantService.php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;
use Stancl\Tenancy\Facades\Tenancy;

class TenantService
{
    public function createTenant(array $data): Tenant
    {
        $tenant = Tenant::create([
            'id' => Str::uuid(),
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'domain' => $data['domain'],
            'database_name' => 'tenant_' . Str::random(8),
            'plan_id' => $data['plan_id'],
            'status' => 'active',
            'trial_ends_at' => now()->addDays(14)
        ]);

        // Create tenant database
        $this->createTenantDatabase($tenant);

        // Run migrations
        $this->runTenantMigrations($tenant);

        // Seed default data
        $this->seedTenantDefaults($tenant);

        return $tenant;
    }

    private function createTenantDatabase(Tenant $tenant): void
    {
        DB::statement("CREATE DATABASE `{$tenant->database_name}`");
    }

    private function runTenantMigrations(Tenant $tenant): void
    {
        Artisan::call('tenants:migrate', [
            '--tenants' => [$tenant->id]
        ]);
    }

    private function seedTenantDefaults(Tenant $tenant): void
    {
        Tenancy::initialize($tenant);
        
        Artisan::call('db:seed', [
            '--class' => 'TenantDefaultSeeder'
        ]);
    }

    public function createTenantOwner(Tenant $tenant, array $ownerData)
    {
        Tenancy::initialize($tenant);

        return \App\Models\User::create([
            'name' => $ownerData['name'],
            'email' => $ownerData['email'],
            'password' => bcrypt($ownerData['password']),
            'is_active' => true,
        ]);
    }
}
```

### 2. Billing Service

```php
<?php
// app/Services/BillingService.php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use Stripe\StripeClient;

class BillingService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createSubscription(Tenant $tenant, Plan $plan, string $paymentMethodId): Subscription
    {
        // Create Stripe customer
        $customer = $this->stripe->customers->create([
            'email' => $tenant->owner_email,
            'name' => $tenant->name,
            'payment_method' => $paymentMethodId,
            'invoice_settings' => [
                'default_payment_method' => $paymentMethodId
            ]
        ]);

        // Create Stripe subscription
        $stripeSubscription = $this->stripe->subscriptions->create([
            'customer' => $customer->id,
            'items' => [['price' => $plan->stripe_price_id]],
            'trial_period_days' => $plan->trial_days,
            'expand' => ['latest_invoice.payment_intent']
        ]);

        // Create local subscription record
        return Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'stripe_subscription_id' => $stripeSubscription->id,
            'status' => 'trialing',
            'trial_ends_at' => now()->addDays($plan->trial_days)
        ]);
    }

    public function handleWebhook(array $payload): void
    {
        $event = $payload['type'];
        $data = $payload['data']['object'];

        switch ($event) {
            case 'invoice.payment_succeeded':
                $this->handlePaymentSucceeded($data);
                break;
            case 'invoice.payment_failed':
                $this->handlePaymentFailed($data);
                break;
            case 'customer.subscription.deleted':
                $this->handleSubscriptionCancelled($data);
                break;
        }
    }

    private function handlePaymentSucceeded(array $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
        
        if ($subscription) {
            $subscription->update(['status' => 'active']);
        }
    }

    private function handlePaymentFailed(array $invoice): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $invoice['subscription'])->first();
        
        if ($subscription) {
            $subscription->update(['status' => 'past_due']);
        }
    }

    private function handleSubscriptionCancelled(array $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription['id'])->first();
        
        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'ends_at' => now()
            ]);
        }
    }
}
```

---

## 🎨 Frontend Components

### 1. Plan Selection Component

```jsx
// resources/js/Pages/Landing/SelectPlan.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import LandingLayout from '@/Layouts/LandingLayout';

export default function SelectPlan({ plans }) {
    return (
        <LandingLayout>
            <Head title="Choose Your Plan" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Choose the perfect plan for your business
                        </h2>
                        <p className="mt-4 text-xl text-gray-600">
                            Start with a 14-day free trial. No credit card required.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-8 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-white rounded-lg shadow-lg p-8">
                                <div className="text-center">
                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-4">
                                        <span className="text-4xl font-extrabold text-gray-900">
                                            ${plan.price}
                                        </span>
                                        <span className="text-base font-medium text-gray-500">
                                            /{plan.billing_cycle}
                                        </span>
                                    </div>
                                </div>

                                <ul className="mt-8 space-y-4">
                                    {plan.features.modules.map((module) => (
                                        <li key={module} className="flex items-center">
                                            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="ml-3 text-gray-700 capitalize">
                                                {module.replace('_', ' ')} Module
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8">
                                    <Link
                                        href={`/register/${plan.id}`}
                                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
}
```

### 2. Registration Form Component

```jsx
// resources/js/Pages/Landing/Register.jsx

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LandingLayout from '@/Layouts/LandingLayout';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

function RegistrationForm({ plan }) {
    const { data, setData, post, processing, errors } = useForm({
        plan_id: plan.id,
        company_name: '',
        company_domain: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        owner_password_confirmation: '',
    });

    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);

        // Create payment method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setCardError(error.message);
            return;
        }

        // Submit form with payment method
        post('/register', {
            ...data,
            payment_method_id: paymentMethod.id,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Company Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={data.company_name}
                            onChange={e => setData('company_name', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            required
                        />
                        {errors.company_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Company Domain
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                                type="text"
                                value={data.company_domain}
                                onChange={e => setData('company_domain', e.target.value)}
                                className="flex-1 border-gray-300 rounded-l-md"
                                placeholder="yourcompany"
                                required
                            />
                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                .aero-hr.com
                            </span>
                        </div>
                        {errors.company_domain && (
                            <p className="mt-1 text-sm text-red-600">{errors.company_domain}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Account Owner</h3>
                
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.owner_name}
                            onChange={e => setData('owner_name', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={data.owner_email}
                            onChange={e => setData('owner_email', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            value={data.owner_password}
                            onChange={e => setData('owner_password', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Your 14-day free trial starts now. You won't be charged until the trial ends.
                </p>
                
                <div className="border border-gray-300 rounded-md p-3">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                        }}
                    />
                </div>
                {cardError && (
                    <p className="mt-2 text-sm text-red-600">{cardError}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing || !stripe}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? 'Creating Account...' : 'Start Free Trial'}
            </button>
        </form>
    );
}

export default function Register({ plan }) {
    return (
        <LandingLayout>
            <Head title={`Register - ${plan.name} Plan`} />
            
            <div className="py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Create Your Account
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            {plan.name} Plan - ${plan.price}/{plan.billing_cycle}
                        </p>
                    </div>

                    <Elements stripe={stripePromise}>
                        <RegistrationForm plan={plan} />
                    </Elements>
                </div>
            </div>
        </LandingLayout>
    );
}
```

---

## 🚀 Next Steps

### 1. Environment Setup
```bash
# Add to .env file
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

CENTRAL_DOMAIN=aero-hr.com
TENANT_DOMAIN_SUFFIX=.aero-hr.com
```

### 2. Run Migrations
```bash
# Create central database tables
php artisan migrate --path=database/migrations/central

# Publish tenancy migrations
php artisan vendor:publish --provider="Stancl\Tenancy\TenancyServiceProvider" --tag=migrations
```

### 3. Seed Initial Data
```bash
# Create plans
php artisan db:seed --class=PlansSeeder
```

### 4. Configure Domain Routing
Update your DNS and web server to route subdomains to your application.

This starter guide provides the foundation for your multi-tenant SaaS conversion. Each component is ready to implement and can be customized based on your specific requirements.
