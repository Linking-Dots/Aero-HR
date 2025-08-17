<?php

namespace Tests\Unit\Jobs;

use App\Events\TenantProvisioned;
use App\Events\TenantProvisioningFailed;
use App\Jobs\ProvisionTenantJob;
use App\Models\Tenant;
use App\Models\TenantUserLookup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProvisionTenantJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use platform database for tests
        Config::set('database.default', 'platform');
        
        // Fresh migration rollback and migrate
        Artisan::call('migrate:fresh', [
            '--database' => 'platform',
            '--path' => 'database/migrations/platform',
            '--force' => true,
        ]);
    }

    /** @test */
    public function it_can_be_dispatched()
    {
        Queue::fake();
        
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        $adminUser = ['name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'password'];
        
        ProvisionTenantJob::dispatch($tenant, $adminUser);
        
        Queue::assertPushed(ProvisionTenantJob::class);
    }

    /** @test */
    public function it_is_idempotent_for_already_provisioned_tenants()
    {
        $tenant = Tenant::factory()->create([
            'status' => 'active',
            'db_name' => 'test_tenant_db',
        ]);
        
        // Mock database existence check
        DB::shouldReceive('connection')
            ->with('tenant_admin')
            ->once()
            ->andReturnSelf();
            
        DB::shouldReceive('select')
            ->with("SHOW DATABASES LIKE 'test_tenant_db'")
            ->once()
            ->andReturn([['Database' => 'test_tenant_db']]);
        
        $job = new ProvisionTenantJob($tenant, []);
        
        // Should return early without processing
        $this->assertNull($job->handle());
    }

    /** @test */
    public function it_generates_database_credentials_when_missing()
    {
        $tenant = Tenant::factory()->create([
            'status' => 'pending',
            'db_name' => null,
            'db_username' => null,
            'db_password' => null,
        ]);
        
        $job = new ProvisionTenantJob($tenant, []);
        
        // Use reflection to call protected method
        $reflection = new \ReflectionClass($job);
        $method = $reflection->getMethod('generateDatabaseCredentials');
        $method->setAccessible(true);
        
        $method->invoke($job);
        
        $tenant->refresh();
        
        $this->assertNotNull($tenant->db_name);
        $this->assertStringStartsWith('saas_tenant_', $tenant->db_name);
        $this->assertNotNull($tenant->db_username);
        $this->assertStringStartsWith('tenant_', $tenant->db_username);
        $this->assertNotNull($tenant->db_password);
        $this->assertEquals(32, strlen($tenant->db_password));
    }

    /** @test */
    public function it_emits_success_event_on_completion()
    {
        Event::fake();
        
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        
        // Mock successful provisioning
        $this->mockSuccessfulProvisioning($tenant);
        
        $job = new ProvisionTenantJob($tenant, []);
        $job->handle();
        
        Event::assertDispatched(TenantProvisioned::class, function ($event) use ($tenant) {
            return $event->tenant->id === $tenant->id;
        });
    }

    /** @test */
    public function it_emits_failure_event_on_error()
    {
        Event::fake();
        
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        
        // Mock database creation failure
        DB::shouldReceive('connection')
            ->with('tenant_admin')
            ->andThrow(new \Exception('Database creation failed'));
        
        $job = new ProvisionTenantJob($tenant, []);
        
        $this->expectException(\Exception::class);
        $job->handle();
        
        Event::assertDispatched(TenantProvisioningFailed::class, function ($event) use ($tenant) {
            return $event->tenant->id === $tenant->id;
        });
    }

    /** @test */
    public function it_creates_admin_user_and_lookup_entry()
    {
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        $adminUser = [
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => 'secret123',
        ];
        
        // Mock successful provisioning
        $this->mockSuccessfulProvisioning($tenant);
        
        // Mock tenant database user creation
        DB::shouldReceive('connection')
            ->with("tenant_{$tenant->id}")
            ->andReturnSelf();
            
        DB::shouldReceive('table')
            ->with('users')
            ->andReturnSelf();
            
        DB::shouldReceive('insertGetId')
            ->once()
            ->andReturn(1);
            
        // Mock role assignment for Tenant Admin
        DB::shouldReceive('table')
            ->with('roles')
            ->andReturnSelf();
            
        DB::shouldReceive('where')
            ->with('name', 'Tenant Admin')
            ->andReturnSelf();
            
        DB::shouldReceive('value')
            ->with('id')
            ->andReturn(1);
            
        DB::shouldReceive('table')
            ->with('model_has_roles')
            ->andReturnSelf();
            
        DB::shouldReceive('insert')
            ->once()
            ->andReturn(true);
        
        $job = new ProvisionTenantJob($tenant, $adminUser);
        $job->handle();
        
        // Check that lookup entry was created
        $this->assertDatabaseHas('tenant_user_lookup', [
            'email' => 'admin@test.com',
            'tenant_id' => $tenant->id,
            'is_admin' => true,
        ]);
    }

    /** @test */
    public function it_seeds_comprehensive_roles_and_permissions()
    {
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        
        // Mock successful provisioning without seeding
        $this->mockSuccessfulProvisioningWithoutSeeding($tenant);
        
        // Mock the comprehensive role seeding specifically
        Artisan::shouldReceive('call')
            ->with('db:seed', [
                '--database' => "tenant_{$tenant->id}",
                '--class' => 'Database\\Seeders\\Tenant\\TenantRolesSeeder',
                '--force' => true,
            ])
            ->once()
            ->andReturn(0);
            
        // Mock settings and departments seeding
        DB::shouldReceive('table')
            ->with('settings')
            ->andReturnSelf();
            
        DB::shouldReceive('insertOrIgnore')
            ->times(8) // 8 default settings
            ->andReturn(true);
            
        DB::shouldReceive('table')
            ->with('departments')
            ->andReturnSelf();
            
        DB::shouldReceive('insertOrIgnore')
            ->times(4) // 4 default departments
            ->andReturn(true);
        
        $job = new ProvisionTenantJob($tenant, [], true); // shouldSeedData = true
        $job->handle();
        
        $tenant->refresh();
        $this->assertEquals('active', $tenant->status);
    }

    /** @test */
    public function it_can_skip_seeding_when_requested()
    {
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        
        // Mock successful provisioning
        $this->mockSuccessfulProvisioningWithoutSeeding($tenant);
        
        // Should NOT call seeding
        Artisan::shouldNotReceive('call')
            ->with('db:seed', \Mockery::any());
        
        $job = new ProvisionTenantJob($tenant, [], false); // shouldSeedData = false
        $job->handle();
        
        $tenant->refresh();
        $this->assertEquals('active', $tenant->status);
    }

    /** @test */
    public function it_cleans_up_on_failure()
    {
        $tenant = Tenant::factory()->create(['status' => 'pending']);
        
        // Mock partial provisioning failure
        DB::shouldReceive('connection')
            ->with('tenant_admin')
            ->times(3) // Initial call, cleanup calls
            ->andReturnSelf();
            
        // Mock database creation success
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/CREATE DATABASE/'))
            ->once();
            
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/CREATE USER/'))
            ->once();
            
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/GRANT ALL/'))
            ->once();
            
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/FLUSH PRIVILEGES/'))
            ->once();
        
        // Mock migration failure
        Artisan::shouldReceive('call')
            ->with('migrate', \Mockery::any())
            ->andThrow(new \Exception('Migration failed'));
        
        // Mock cleanup calls
        DB::shouldReceive('select')
            ->with(\Mockery::pattern('/SHOW DATABASES/'))
            ->andReturn([['Database' => $tenant->db_name]]);
            
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/DROP DATABASE/'))
            ->once();
            
        DB::shouldReceive('statement')
            ->with(\Mockery::pattern('/DROP USER/'))
            ->once();
        
        $job = new ProvisionTenantJob($tenant, []);
        
        $this->expectException(\Exception::class);
        $job->handle();
        
        $tenant->refresh();
        $this->assertEquals('failed', $tenant->status);
    }

    /**
     * Mock successful provisioning process.
     */
    protected function mockSuccessfulProvisioning(Tenant $tenant): void
    {
        // Mock database checks
        DB::shouldReceive('connection')
            ->with('tenant_admin')
            ->andReturnSelf();
            
        DB::shouldReceive('select')
            ->with(\Mockery::pattern('/SHOW DATABASES/'))
            ->andReturn([]);
        
        // Mock database creation
        DB::shouldReceive('statement')->times(4);
        
        // Mock connection configuration
        DB::shouldReceive('connection')
            ->with("tenant_{$tenant->id}")
            ->andReturnSelf();
            
        DB::shouldReceive('getPdo')
            ->andReturn(new \PDO('sqlite::memory:'));
        
        // Mock migrations
        Artisan::shouldReceive('call')
            ->with('migrate', \Mockery::any())
            ->andReturn(0);
            
        Artisan::shouldReceive('output')
            ->andReturn('Migration completed successfully');
        
        // Mock comprehensive role seeding
        Artisan::shouldReceive('call')
            ->with('db:seed', [
                '--database' => "tenant_{$tenant->id}",
                '--class' => 'Database\\Seeders\\Tenant\\TenantRolesSeeder',
                '--force' => true,
            ])
            ->andReturn(0);
            
        // Mock settings table creation
        DB::shouldReceive('table')
            ->with('settings')
            ->andReturnSelf();
            
        DB::shouldReceive('insertOrIgnore')
            ->andReturn(true);
            
        // Mock departments table creation
        DB::shouldReceive('table')
            ->with('departments')
            ->andReturnSelf();
            
        DB::shouldReceive('insertOrIgnore')
            ->andReturn(true);
        
        // Mock storage operations
        Storage::shouldReceive('disk')
            ->with('s3')
            ->andReturnSelf();
            
        Storage::shouldReceive('put')
            ->andReturn(true);
    }

    /**
     * Mock successful provisioning process without seeding.
     */
    protected function mockSuccessfulProvisioningWithoutSeeding(Tenant $tenant): void
    {
        // Mock database checks
        DB::shouldReceive('connection')
            ->with('tenant_admin')
            ->andReturnSelf();
            
        DB::shouldReceive('select')
            ->with(\Mockery::pattern('/SHOW DATABASES/'))
            ->andReturn([]);
        
        // Mock database creation
        DB::shouldReceive('statement')->times(4);
        
        // Mock connection configuration
        DB::shouldReceive('connection')
            ->with("tenant_{$tenant->id}")
            ->andReturnSelf();
            
        DB::shouldReceive('getPdo')
            ->andReturn(new \PDO('sqlite::memory:'));
        
        // Mock migrations
        Artisan::shouldReceive('call')
            ->with('migrate', \Mockery::any())
            ->andReturn(0);
            
        Artisan::shouldReceive('output')
            ->andReturn('Migration completed successfully');
        
        // Mock storage operations
        Storage::shouldReceive('makeDirectory')
            ->andReturn(true);
    }
}
