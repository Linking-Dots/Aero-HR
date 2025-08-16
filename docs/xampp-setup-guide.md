# XAMPP Multi-Tenant Setup Guide for Aero-HR

## Prerequisites
- XAMPP installed with Apache, MySQL, and PHP
- Your Aero-HR project in `D:\Repos\Aero-HR`

## Step 1: Configure Apache Virtual Hosts

### 1.1 Edit httpd.conf
1. Open XAMPP Control Panel
2. Click "Config" next to Apache → "httpd.conf"
3. Find and uncomment this line (remove the #):
```apache
Include conf/extra/httpd-vhosts.conf
```

### 1.2 Edit httpd-vhosts.conf
1. Open: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
2. Replace the entire content with:

```apache
# Virtual Hosts Configuration for Aero-HR Multi-Tenant

# Main Central Domain (SaaS Admin)
<VirtualHost *:80>
    ServerName aero-hr.local
    DocumentRoot "D:/Repos/Aero-HR/public"
    ErrorLog "logs/aero-hr-error.log"
    CustomLog "logs/aero-hr-access.log" common
    
    <Directory "D:/Repos/Aero-HR/public">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
    
    SetEnv APP_ENV local
    SetEnv APP_DEBUG true
</VirtualHost>

# Tenant Subdomains (Wildcard)
<VirtualHost *:80>
    ServerAlias *.aero-hr.local
    DocumentRoot "D:/Repos/Aero-HR/public"
    ErrorLog "logs/aero-hr-tenant-error.log"
    CustomLog "logs/aero-hr-tenant-access.log" common
    
    <Directory "D:/Repos/Aero-HR/public">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
    
    SetEnv APP_ENV local
    SetEnv APP_DEBUG true
</VirtualHost>

# Individual Tenant Examples (Optional - for specific testing)
<VirtualHost *:80>
    ServerName dbedc.aero-hr.local
    DocumentRoot "D:/Repos/Aero-HR/public"
    ErrorLog "logs/dbedc-error.log"
    CustomLog "logs/dbedc-access.log" common
    
    <Directory "D:/Repos/Aero-HR/public">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
</VirtualHost>

<VirtualHost *:80>
    ServerName acme.aero-hr.local
    DocumentRoot "D:/Repos/Aero-HR/public"
    ErrorLog "logs/acme-error.log"
    CustomLog "logs/acme-access.log" common
    
    <Directory "D:/Repos/Aero-HR/public">
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
</VirtualHost>
```

## Step 2: Configure Windows Hosts File

### 2.1 Edit Hosts File
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add these lines at the end:

```
# Aero-HR Multi-Tenant Local Domains
127.0.0.1    aero-hr.local
127.0.0.1    dbedc.aero-hr.local
127.0.0.1    acme.aero-hr.local
127.0.0.1    company1.aero-hr.local
127.0.0.1    company2.aero-hr.local
127.0.0.1    test.aero-hr.local
```

## Step 3: Configure Laravel Environment

### 3.1 Update .env File
```env
APP_NAME="Aero HR"
APP_ENV=local
APP_KEY=base64:your-app-key-here
APP_DEBUG=true
APP_URL=http://aero-hr.local

# Central Domain
CENTRAL_DOMAIN=aero-hr.local
CENTRAL_DOMAINS=aero-hr.local

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aero_hr_central
DB_USERNAME=root
DB_PASSWORD=

# Tenancy Configuration
TENANCY_DATABASE_AUTO_DELETE=false
TENANCY_DATABASE_TEMPLATE=template

# Session and Cache
SESSION_DOMAIN=.aero-hr.local
SANCTUM_STATEFUL_DOMAINS=aero-hr.local,*.aero-hr.local
```

### 3.2 Update Tenancy Configuration
Edit `config/tenancy.php`:
```php
'central_domains' => [
    'aero-hr.local',
],
```

## Step 4: Database Setup

### 4.1 Create Central Database
```sql
-- Connect to MySQL via phpMyAdmin or command line
CREATE DATABASE aero_hr_central;
```

### 4.2 Run Migrations
```bash
# Navigate to your project
cd D:\Repos\Aero-HR

# Run central migrations
php artisan migrate

# Seed initial data
php artisan db:seed
```

## Step 5: Create Test Tenants

### 5.1 Create Tenants via Database or Code
Create a simple script `create_tenants.php`:

```php
<?php
require_once 'vendor/autoload.php';

use App\Models\Tenant;
use Illuminate\Support\Str;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create test tenants
$tenants = [
    ['domain' => 'dbedc', 'name' => 'DBEDC Company'],
    ['domain' => 'acme', 'name' => 'Acme Corporation'],
    ['domain' => 'test', 'name' => 'Test Company'],
];

foreach ($tenants as $tenantData) {
    $tenant = Tenant::create([
        'id' => (string) Str::uuid(),
        'name' => $tenantData['name'],
        'slug' => Str::slug($tenantData['name']),
        'domain' => $tenantData['domain'],
        'database_name' => 'tenant_' . $tenantData['domain'],
        'plan_id' => 1,
        'status' => 'active',
        'trial_ends_at' => now()->addDays(14),
        'settings' => []
    ]);
    
    echo "Created tenant: {$tenantData['domain']}.aero-hr.local\n";
}
```

Run it: `php create_tenants.php`

## Step 6: Testing the Setup

### 6.1 Restart Apache
- In XAMPP Control Panel, stop and start Apache

### 6.2 Test URLs

**Central Domain (SaaS Admin):**
- Main site: `http://aero-hr.local`
- Admin login: `http://aero-hr.local/login`
- Registration: `http://aero-hr.local/register`
- Admin dashboard: `http://aero-hr.local/admin`

**Tenant Domains:**
- DBEDC login: `http://dbedc.aero-hr.local/login`
- ACME login: `http://acme.aero-hr.local/login`
- Test company: `http://test.aero-hr.local/login`

## Step 7: Troubleshooting

### 7.1 Common Issues

**403 Forbidden Error:**
- Check directory permissions
- Ensure `AllowOverride All` is set
- Verify DocumentRoot path is correct

**Domain not found:**
- Check hosts file entries
- Restart browser
- Clear DNS cache: `ipconfig /flushdns`

**Database connection errors:**
- Verify MySQL is running in XAMPP
- Check database credentials in .env
- Ensure central database exists

### 7.2 Debug Commands
```bash
# Check route list
php artisan route:list

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check tenants
php artisan tenants:list
```

## Step 8: Production-Like Testing

### 8.1 SSL Setup (Optional)
To test with HTTPS:

1. Generate SSL certificate for local testing
2. Update virtual hosts to use port 443
3. Update .env to use https URLs

### 8.2 Performance Testing
- Enable caching: `php artisan config:cache`
- Test with production settings
- Monitor logs in `C:\xampp\apache\logs\`

## Step 9: Additional Test Scenarios

### 9.1 Multi-Tenant Registration Flow
1. Visit `http://aero-hr.local/register`
2. Register a new company (e.g., "newcompany")
3. System should create tenant and redirect
4. Test login at `http://newcompany.aero-hr.local/login`

### 9.2 Central Admin Management
1. Login to central domain as superadmin
2. Visit `http://aero-hr.local/admin`
3. Manage tenants, view statistics
4. Test billing and subscription features

## Security Notes
- This setup is for local development only
- Never use these configurations in production
- Use proper SSL certificates for production
- Implement proper security measures for live servers

## File Structure After Setup
```
C:\xampp\
├── apache\conf\extra\httpd-vhosts.conf (modified)
├── apache\conf\httpd.conf (modified)
└── apache\logs\ (log files)

C:\Windows\System32\drivers\etc\
└── hosts (modified)

D:\Repos\Aero-HR\
├── .env (updated)
├── config\tenancy.php (updated)
└── create_tenants.php (created)
```

This setup gives you a production-like environment for testing your multi-tenant Laravel application with proper domain routing!
