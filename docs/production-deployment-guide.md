# Production Deployment Guide for Multi-Tenant SaaS

## Issue: TenantCouldNotBeIdentifiedOnDomainException

This error occurs when the tenancy system cannot identify whether a domain should be handled as a central domain or tenant domain.

## Quick Fix

### 1. Update Environment Variables

Create/update your `.env` file on the production server:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://linkingdots.dev
CENTRAL_DOMAIN=linkingdots.dev

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=your_db_host
DB_PORT=3306
DB_DATABASE=your_central_database
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# Tenancy Configuration
TENANCY_DATABASE_AUTO_DELETE=false
```

### 2. Run Setup Command

After deploying your code, run this command on your production server:

```bash
php artisan tenancy:setup-production linkingdots.dev --create-demo-tenant
```

### 3. Configure Web Server

Make sure your web server (Apache/Nginx) is configured to handle both:
- Main domain: `linkingdots.dev` (central domain)
- Subdomains: `*.linkingdots.dev` (tenant domains)

#### Nginx Configuration Example:

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name linkingdots.dev *.linkingdots.dev;
    
    root /path/to/your/project/public;
    index index.php index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

#### Apache Configuration Example:

```apache
<VirtualHost *:80>
    <VirtualHost *:443>
    ServerName linkingdots.dev
    ServerAlias *.linkingdots.dev
    DocumentRoot /path/to/your/project/public
    
    <Directory "/path/to/your/project/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## Manual Database Setup (Alternative)

If the command doesn't work, you can manually set up the tenancy:

### 1. Run Migrations

```bash
php artisan migrate --force
```

### 2. Create a Demo Tenant (Optional)

```bash
php artisan tinker
```

Then in the tinker console:

```php
// Create tenant
$tenant = App\Models\Tenant::create([
    'id' => 'demo',
    'name' => 'Demo Company',
    'email' => 'admin@demo.com'
]);

// Create domain for tenant
$tenant->domains()->create([
    'domain' => 'demo.linkingdots.dev'
]);

// Initialize tenant and run migrations
tenancy()->initialize($tenant);
Artisan::call('migrate', ['--force' => true]);
tenancy()->end();
```

### 3. Clear Caches

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

## Testing the Setup

After setup, you should be able to access:

1. **Central Domain**: https://linkingdots.dev
   - Should show the main landing page or super admin login
   
2. **Demo Tenant**: https://demo.linkingdots.dev (if created)
   - Should show the tenant login page

## Troubleshooting

### 1. 404 Error - Page Not Found

If you're getting 404 errors, check these common issues:

#### A. Document Root Configuration
Your web server must point to the `public` directory:

**Correct**: `/path/to/your/project/public`
**Wrong**: `/path/to/your/project`

#### B. Check .htaccess File (Apache)
Ensure the `.htaccess` file exists in the `public` directory:

```bash
ls -la public/.htaccess
```

If missing, create it:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### C. Enable Apache mod_rewrite
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### D. Check File Permissions
```bash
# Make sure web server can read files
chmod -R 755 /path/to/your/project
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data /path/to/your/project
```

#### E. Check Laravel Installation
```bash
php artisan --version
```

#### F. Test Direct Access to index.php
Try accessing: `https://linkingdots.dev/index.php`

If this works, it's a URL rewriting issue.

### 2. Check Central Domains Configuration

Verify that `linkingdots.dev` is in the central domains list:

```bash
php artisan tinker
config('tenancy.central_domains')
```

### 2. Check Database Connection

```bash
php artisan migrate:status
```

### 3. Check Tenant Domains

```bash
php artisan tinker
Stancl\Tenancy\Database\Models\Domain::all()
```

### 4. Check Application Logs

```bash
tail -f storage/logs/laravel.log
```

## Directory Structure After Deployment

```
/var/www/html/linkingdots.dev/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          # Web server document root
├── resources/
├── routes/
├── storage/
├── vendor/
├── .env             # Production environment file
└── artisan
```

## Security Considerations

1. Set proper file permissions:
```bash
chmod -R 755 /path/to/project
chmod -R 775 storage bootstrap/cache
```

2. Secure environment file:
```bash
chmod 600 .env
```

3. Configure SSL certificates for both main domain and wildcard subdomains.

4. Set up proper database user permissions for central and tenant databases.
