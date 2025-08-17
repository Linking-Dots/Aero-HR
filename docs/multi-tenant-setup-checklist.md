# Multi-Tenant SaaS Setup Checklist

## Required Dependencies (Already Installed)
✅ `stancl/tenancy` (already in composer.json)
✅ `laravel/cashier` (already in composer.json)

## Additional Dependencies Needed
Run these commands to install missing packages:

```bash
composer require predis/predis
composer require sentry/sentry-laravel
```

## Environment Variables Required

Add these to your `.env` file:

```env
# Platform Database (Central/System DB)
PLATFORM_DB_CONNECTION=mysql
PLATFORM_DB_HOST=127.0.0.1
PLATFORM_DB_PORT=3306
PLATFORM_DB_DATABASE=aero_hr_platform
PLATFORM_DB_USERNAME=root
PLATFORM_DB_PASSWORD=

# Tenant Database Admin Credentials (for creating tenant DBs)
TENANT_DB_ADMIN_USERNAME=root
TENANT_DB_ADMIN_PASSWORD=
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=3306

# Queue Configuration
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Storage Configuration  
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=aero-hr-saas
AWS_USE_PATH_STYLE_ENDPOINT=false

# Stripe Configuration
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CASHIER_CURRENCY=usd

# Tenancy Configuration
CENTRAL_DOMAINS=mysoftwaredomain.com,localhost
TENANT_DB_PREFIX=saas_tenant_

# Sentry Monitoring
SENTRY_LARAVEL_DSN=
```

## Docker Compose Setup (Optional)

Create `docker-compose.override.yml` for local multi-DB development:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: aero_hr_platform
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
      
volumes:
  mysql_data:
```

## Setup Commands Checklist

1. **Install Dependencies**
   ```bash
   composer require predis/predis sentry/sentry-laravel
   ```

2. **Update Environment**
   - Copy variables above to `.env`
   - Update database credentials

3. **Create Platform Database**
   ```sql
   CREATE DATABASE aero_hr_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Publish Tenancy Config**
   ```bash
   php artisan vendor:publish --provider="Stancl\Tenancy\TenancyServiceProvider"
   ```

5. **Configure Queue Worker**
   ```bash
   php artisan queue:table
   php artisan migrate
   ```

## Infrastructure Requirements

- **MySQL 8.0+** with ability to create databases dynamically
- **Redis** for queue management and caching
- **S3-compatible storage** for tenant file isolation
- **SSL certificates** for `*.mysoftwaredomain.com` wildcard

## Security Considerations

- Tenant DB passwords will be encrypted using Laravel's encryption
- For production, consider AWS Secrets Manager for credential storage
- Implement rate limiting on tenant provisioning endpoints
- Use separate DB users with limited privileges for tenant databases
