# Development Server Setup - Multi-Tenant on 127.0.0.1:8000

## Quick Start Guide

### 1. Start the Development Server
```bash
php artisan serve
# Server runs on: http://127.0.0.1:8000
```

### 2. Access Central Domain (Registration)
```
URL: http://127.0.0.1:8000
Description: Main landing page and registration
```

### 3. Register a New Company
```
1. Go to: http://127.0.0.1:8000/register
2. Fill out company registration form:
   - Company Name: "Test Corp"
   - Domain: "testcorp" (this will be used in URLs)
   - Owner details and plan selection
3. Complete registration
4. You'll be redirected to tenant login URL
```

### 4. Access Tenant Login (Company-Specific)
```
URL Pattern: http://127.0.0.1:8000/tenant/{company-domain}/login
Example: http://127.0.0.1:8000/tenant/testcorp/login

Use the owner credentials from registration to login.
```

### 5. Access Tenant Dashboard
```
URL Pattern: http://127.0.0.1:8000/tenant/{company-domain}/dashboard
Example: http://127.0.0.1:8000/tenant/testcorp/dashboard
```

## Development URLs

### Central Domain Routes
- **Home**: `http://127.0.0.1:8000/`
- **Registration**: `http://127.0.0.1:8000/register`
- **Pricing**: `http://127.0.0.1:8000/pricing`
- **Dev Tenants List**: `http://127.0.0.1:8000/dev/tenants` (shows all registered companies)

### Tenant Routes (Path-Based)
- **Login**: `http://127.0.0.1:8000/tenant/{domain}/login`
- **Dashboard**: `http://127.0.0.1:8000/tenant/{domain}/dashboard`
- **Employees**: `http://127.0.0.1:8000/tenant/{domain}/employees`
- **Leaves**: `http://127.0.0.1:8000/tenant/{domain}/leaves`
- **Attendance**: `http://127.0.0.1:8000/tenant/{domain}/attendance`
- **Settings**: `http://127.0.0.1:8000/tenant/{domain}/settings/company`

## How It Works in Development

### Path-Based Tenancy
In development mode (`127.0.0.1:8000`), the system uses **path-based tenancy** instead of subdomains:

```php
// Development URLs
http://127.0.0.1:8000/tenant/company1/login
http://127.0.0.1:8000/tenant/company2/login

// vs Production URLs (subdomain-based)
https://company1.aero-hr.com/login
https://company2.aero-hr.com/login
```

### Tenant Identification
The system automatically detects development mode and switches to path-based tenant identification:

```php
// In routes/tenant.php
$isDevelopment = app()->environment('local') && 
    (request()->getHost() === '127.0.0.1' || request()->getHost() === 'localhost');

if ($isDevelopment) {
    // Use InitializeTenancyByPath middleware
    Route::prefix('tenant/{tenant}')->middleware([
        'web',
        InitializeTenancyByPath::class,
    ])->group($tenantRoutes);
}
```

## Testing Multiple Tenants

### 1. Register Multiple Companies
```bash
# Company 1
http://127.0.0.1:8000/register
- Company: "Tech Corp"
- Domain: "techcorp"

# Company 2  
http://127.0.0.1:8000/register
- Company: "Business Inc"
- Domain: "businessinc"
```

### 2. Test Tenant Isolation
```bash
# Login to Tech Corp
http://127.0.0.1:8000/tenant/techcorp/login

# Try to access Business Inc data (should be isolated)
http://127.0.0.1:8000/tenant/businessinc/dashboard
# This should require separate login
```

### 3. Verify Data Separation
Each tenant gets its own:
- Database tables (tenant-specific)
- User sessions
- File storage
- Cache namespace

## Development Tools

### List All Tenants
```bash
# Via API
curl http://127.0.0.1:8000/dev/tenants

# Via Artisan
php artisan tenants:list
```

### Run Commands for Specific Tenant
```bash
# Migrate specific tenant
php artisan tenants:run "php artisan migrate" --tenant=testcorp

# Seed specific tenant
php artisan tenants:run "php artisan db:seed" --tenant=testcorp
```

### Check Tenant Database
```bash
# Show tenant database info
php artisan tenants:run "php artisan db:show" --tenant=testcorp
```

## Environment Configuration

### Required .env Settings
```env
# Application
APP_ENV=local
APP_URL=http://127.0.0.1:8000

# Database (Central)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=aero_hr_central

# Tenancy
CENTRAL_DOMAIN=127.0.0.1
```

### Optional Development Settings
```env
# Debug
APP_DEBUG=true
LOG_LEVEL=debug

# Queue (for async tenant creation)
QUEUE_CONNECTION=sync

# Cache
CACHE_DRIVER=array
```

## Common Development Issues

### 1. Tenant Not Found
**Error**: "Tenant not found"
**Solution**: 
- Check if tenant was created: `http://127.0.0.1:8000/dev/tenants`
- Verify domain spelling in URL
- Check tenant database exists

### 2. Database Connection Issues
**Error**: Database connection fails for tenant
**Solution**:
```bash
# Check tenant database
php artisan tenants:run "php artisan migrate:status" --tenant=testcorp

# Recreate if needed
php artisan tenants:run "php artisan migrate:fresh" --tenant=testcorp
```

### 3. Session/Auth Issues
**Error**: Login doesn't work or session lost
**Solution**:
- Clear browser cache/cookies
- Check if tenant middleware is working
- Verify session configuration

### 4. Routes Not Working
**Error**: 404 errors on tenant routes
**Solution**:
- Clear route cache: `php artisan route:clear`
- Check if tenant routes are loaded: `php artisan route:list`
- Verify middleware configuration

## Production vs Development

| Feature | Development (127.0.0.1:8000) | Production |
|---------|------------------------------|------------|
| **Tenant Access** | `/tenant/{domain}/` | `{domain}.app.com/` |
| **DNS Required** | No | Yes (wildcard) |
| **SSL/HTTPS** | No | Yes |
| **Middleware** | `InitializeTenancyByPath` | `InitializeTenancyByDomain` |
| **Database** | Same MySQL server | Can be distributed |

## Next Steps

1. **Test Registration Flow**:
   - Register a company
   - Complete all 4 steps
   - Verify tenant login works

2. **Test Multi-Tenancy**:
   - Register 2+ companies
   - Verify data isolation
   - Test cross-tenant access prevention

3. **Test HR Features**:
   - Employee management
   - Leave requests
   - Attendance tracking
   - Reports generation

The development setup is now ready for multi-tenant testing on `127.0.0.1:8000`!
