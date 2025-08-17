<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $slug = $this->faker->unique()->slug(2);
        $uuid = Str::uuid()->toString();
        
        return [
            'id' => $uuid, // UUID as primary key for stancl/tenancy
            'slug' => $slug,
            'name' => $this->faker->company(),
            'email' => $this->faker->companyEmail(),
            'phone' => $this->faker->phoneNumber(),
            'db_name' => 'saas_tenant_' . Str::uuid()->toString(),
            'db_username' => 'tenant_' . Str::random(8),
            'db_password' => Str::random(32),
            'db_host' => '127.0.0.1',
            'db_port' => 3306,
            'status' => 'active',
            'settings' => [
                'timezone' => 'UTC',
                'locale' => 'en',
                'currency' => 'USD',
            ],
            'storage_prefix' => "tenants/{$slug}",
            'data' => [], // Required by stancl/tenancy
        ];
    }

    public function provisioning(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'provisioning',
            ];
        });
    }

    public function pending(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'db_name' => null,
                'db_username' => null,
                'db_password' => null,
            ];
        });
    }

    public function suspended(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'suspended',
                'suspended_at' => now(),
            ];
        });
    }

    public function withTrial(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'trial_ends_at' => now()->addDays(14),
            ];
        });
    }

    public function acme(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'acme',
                'name' => 'Acme Corporation',
                'email' => 'admin@acme.com',
                'phone' => '+1-555-123-4567',
                'storage_prefix' => 'tenants/acme',
            ];
        });
    }
}
