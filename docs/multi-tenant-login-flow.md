# Multi-Tenant Authentication Flow - How Login Works

## Overview

The Aero-HR system uses **Stancl\Tenancy** package to implement multi-tenant authentication with the following architecture:

## Domain Structure

### Central Domain (Main Application)
- **URL**: `aero-hr.local` or `aero-hr.com`
- **Purpose**: Registration, marketing, billing, and central management
- **Routes**: Defined in `routes/central.php`

### Tenant Domains (Company Subdomains)
- **URL**: `{company}.aero-hr.local` or `{company}.aero-hr.com`
- **Purpose**: Company-specific HR operations and employee login
- **Routes**: Defined in `routes/tenant.php`

## Authentication Flow

### 1. Company Registration (Central Domain)
```
User visits: https://aero-hr.com/register
↓
Fills out company registration form
↓
System creates:
- New tenant in central database
- Tenant-specific database
- Owner user in tenant_users table
- Subscription record
↓
Redirects to: https://aero-hr.com/registration-success
↓
Auto-redirects to: https://{company}.aero-hr.com/login
```

### 2. Tenant Login Process
```
User visits: https://{company}.aero-hr.com/login
↓
Tenancy middleware activates:
- InitializeTenancyByDomain (identifies tenant by subdomain)
- PreventAccessFromCentralDomains (blocks central domain access)
↓
Tenant context initialized:
- Database connection switched to tenant database
- Cache/sessions isolated per tenant
- File storage scoped to tenant
↓
Login authentication:
- User credentials validated against tenant database
- User logged into tenant context
- Session stored with tenant isolation
↓
Redirect to: https://{company}.aero-hr.com/dashboard
```

## Key Components

### 1. Tenancy Configuration (`config/tenancy.php`)
```php
'tenant_model' => Tenant::class,
'domain_model' => Domain::class,
'central_domains' => [
    '127.0.0.1',
    'localhost', 
    env('CENTRAL_DOMAIN', 'aero-hr.local'),
],
'bootstrappers' => [
    DatabaseTenancyBootstrapper::class,
    CacheTenancyBootstrapper::class,
    FilesystemTenancyBootstrapper::class,
    QueueTenancyBootstrapper::class,
],
```

### 2. Middleware Stack (Tenant Routes)
```php
Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // All tenant routes
});
```

### 3. Login Controller (`app/Http/Controllers/Auth/LoginController.php`)
```php
public function store(Request $request)
{
    // Rate limiting
    // Find user in current tenant database
    $user = User::where('email', $email)->first();
    
    // Validate credentials
    if (!$user || !Hash::check($password, $user->password)) {
        // Handle failed login
    }
    
    // Login user in tenant context
    Auth::login($user, $remember);
    
    // Redirect to tenant dashboard
    return redirect()->intended(route('dashboard'));
}
```

## Database Structure

### Central Database
```sql
-- Tenant registry
tenants (id, name, domain, plan_id, created_at, ...)

-- Cross-tenant user mapping
tenant_users (id, tenant_id, name, email, role, created_at, ...)

-- Plans and subscriptions
plans (id, name, price, features, ...)
subscriptions (id, tenant_id, plan_id, status, ...)
```

### Tenant Databases (per company)
```sql
-- Company-specific users
users (id, name, email, password, role, department_id, ...)

-- HR data (isolated per tenant)
departments (id, name, ...)
leaves (id, user_id, type, start_date, ...)
attendance (id, user_id, check_in, check_out, ...)
```

## Security Features

### 1. Tenant Isolation
- **Database Separation**: Each tenant has its own database
- **Session Isolation**: Sessions scoped per tenant
- **Cache Isolation**: Cache keys prefixed with tenant ID
- **File Storage**: Files stored in tenant-specific directories

### 2. Access Control
- **Domain Validation**: Tenants can only access their subdomain
- **Role-Based Access**: Users have roles within their tenant
- **Permission System**: Granular permissions per tenant
- **Cross-Tenant Prevention**: Middleware blocks cross-tenant access

### 3. Authentication Security
- **Rate Limiting**: Login attempts limited per IP
- **Account Locking**: Multiple failed attempts lock account
- **Strong Passwords**: Password complexity requirements
- **Session Management**: Secure session handling

## Login URL Generation

### From Registration Success
```php
// In TenantRegistrationController
private function generateTenantLoginUrl(string $domain): string
{
    $appDomain = config('app.domain', 'aero-hr.local');
    
    if (app()->environment('local')) {
        return "http://{$domain}.{$appDomain}/login";
    }
    
    return "https://{$domain}.{$appDomain}/login";
}
```

### For Existing Users
Users bookmark or remember their company's login URL:
- `https://acme.aero-hr.com/login`
- `https://techcorp.aero-hr.com/login`

## Error Scenarios

### 1. Wrong Subdomain
```
User tries: https://wrongcompany.aero-hr.com/login
Result: 404 - Tenant not found
```

### 2. Central Domain Login Attempt
```
User tries: https://aero-hr.com/login (with tenant credentials)
Result: Login works but redirects to registration/landing
```

### 3. Invalid Credentials
```
User enters wrong password on: https://company.aero-hr.com/login
Result: Error message, rate limiting applied
```

## Development Setup

### DNS Configuration (Local)
```
# /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 aero-hr.local
127.0.0.1 *.aero-hr.local
```

### Environment Variables
```env
# Central domain
CENTRAL_DOMAIN=aero-hr.local

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=aero_hr_central

# Tenancy
TENANCY_ENABLED=true
TENANT_DATABASE_PREFIX=tenant_
```

## Testing Multi-Tenant Login

### 1. Register a Company
```
1. Visit: http://aero-hr.local/register
2. Register company "testcorp"
3. Get redirected to: http://testcorp.aero-hr.local/login
```

### 2. Login as Owner
```
1. Use owner credentials from registration
2. Should login to: http://testcorp.aero-hr.local/dashboard
3. Verify tenant context is correct
```

### 3. Test Isolation
```
1. Register another company "company2" 
2. Try to access: http://company2.aero-hr.local with testcorp credentials
3. Should fail - users are isolated per tenant
```

## Troubleshooting

### Common Issues

1. **DNS Resolution**: Wildcard DNS not working
   - Solution: Configure proper DNS or update hosts file

2. **Tenant Not Found**: Subdomain doesn't exist
   - Solution: Verify tenant was created during registration

3. **Database Connection**: Can't connect to tenant database
   - Solution: Check if tenant database was created and migrated

4. **Session Issues**: Login doesn't persist
   - Solution: Verify session configuration and tenant isolation

### Debug Commands
```bash
# List all tenants
php artisan tenants:list

# Run tenant command
php artisan tenants:run "php artisan migrate" --tenant=testcorp

# Check tenant database
php artisan tenants:run "php artisan db:show" --tenant=testcorp
```

## Conclusion

The multi-tenant authentication system provides complete isolation between companies while maintaining a unified platform. Each tenant gets their own login URL, database, and user management, ensuring data security and privacy.

For development, make sure DNS is properly configured to handle wildcard subdomains, and use the central domain for registration and tenant domains for company operations.
