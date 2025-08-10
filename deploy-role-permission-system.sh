#!/bin/bash

# Aero-HR Role Permission System Deployment Script
# This script handles the deployment of the enhanced role-permission system to live server

set -e

echo "🚀 Starting Aero-HR Role Permission System Deployment..."

# Configuration
BACKUP_DIR="/tmp/aero-hr-backup-$(date +%Y%m%d_%H%M%S)"
LOG_FILE="/tmp/aero-hr-deployment-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

if ! command_exists php; then
    error "PHP is not installed or not in PATH"
    exit 1
fi

if ! command_exists composer; then
    error "Composer is not installed or not in PATH"
    exit 1
fi

if ! command_exists npm; then
    error "NPM is not installed or not in PATH"
    exit 1
fi

# Check if we're in a Laravel project
if [ ! -f "artisan" ]; then
    error "This doesn't appear to be a Laravel project root directory"
    exit 1
fi

success "Pre-deployment checks passed"

# Step 1: Create backup
log "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f ".env" ]; then
    DB_NAME=$(grep DB_DATABASE .env | cut -d '=' -f2)
    DB_USER=$(grep DB_USERNAME .env | cut -d '=' -f2)
    DB_PASS=$(grep DB_PASSWORD .env | cut -d '=' -f2)
    
    if [ ! -z "$DB_NAME" ]; then
        log "Backing up database: $DB_NAME"
        mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/database.sql"
        success "Database backup created"
    fi
fi

# Backup critical files
cp -r app/Services/Role "$BACKUP_DIR/Role_Service_OLD" 2>/dev/null || true
cp app/Http/Controllers/RoleController.php "$BACKUP_DIR/RoleController_OLD.php" 2>/dev/null || true
cp resources/js/Pages/Administration/RoleManagement.jsx "$BACKUP_DIR/RoleManagement_OLD.jsx" 2>/dev/null || true

success "Backup created at: $BACKUP_DIR"

# Step 2: Put application in maintenance mode
log "🔧 Putting application in maintenance mode..."
php artisan down --retry=60 --secret="aero-hr-deployment-$(date +%s)"
maintenance_secret=$(php artisan down --show | grep secret | cut -d '=' -f2 2>/dev/null || echo "")

# Step 3: Clear all caches
log "🧹 Clearing all caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan permission:cache-reset
success "Caches cleared"

# Step 4: Install/update dependencies
log "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader
npm ci --only=production
success "Dependencies installed"

# Step 5: Build assets
log "🏗️ Building production assets..."
npm run build
success "Assets built"

# Step 6: Run migrations (if any)
log "🗄️ Running database migrations..."
php artisan migrate --force
success "Migrations completed"

# Step 7: Clear and rebuild permission cache
log "🔄 Rebuilding permission cache..."
php artisan permission:cache-reset
php artisan roles:force-reset-cache --clear-all --rebuild --verify
success "Permission cache rebuilt"

# Step 8: Run diagnostic checks
log "🔍 Running system diagnostics..."
php artisan roles:diagnose --fix --clear-cache
diagnostic_result=$?

if [ $diagnostic_result -eq 0 ]; then
    success "System diagnostics passed"
else
    warning "System diagnostics completed with warnings - check logs"
fi

# Step 9: Warm up caches
log "🔥 Warming up application caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
success "Caches warmed up"

# Step 10: Set proper permissions
log "🔐 Setting file permissions..."
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
success "File permissions set"

# Step 11: Bring application back online
log "🌟 Bringing application back online..."
php artisan up
success "Application is now online"

# Step 12: Final verification
log "✅ Running final verification..."

# Test role permission endpoint
log "Testing role permission endpoint..."
php artisan tinker --execute="
\$service = app(\App\Services\Role\RolePermissionService::class);
\$data = \$service->getRolesWithPermissionsForFrontend();
echo 'Roles: ' . count(\$data['roles']) . PHP_EOL;
echo 'Permissions: ' . count(\$data['permissions']) . PHP_EOL;
echo 'Relationships: ' . count(\$data['role_has_permissions']) . PHP_EOL;
if (count(\$data['roles']) > 0 && count(\$data['permissions']) > 0 && count(\$data['role_has_permissions']) > 0) {
    echo 'SUCCESS: All data loaded correctly' . PHP_EOL;
} else {
    echo 'WARNING: Data seems incomplete' . PHP_EOL;
}
"

# Check if debug routes are accessible (for troubleshooting)
log "Debug endpoints available at:"
echo "  - /admin/roles/debug (system status)"
echo "  - /admin/roles/debug/refresh-cache (clear cache)"
echo "  - Artisan commands:"
echo "    - php artisan roles:diagnose (comprehensive check)"
echo "    - php artisan roles:force-reset-cache --clear-all --rebuild (emergency cache reset)"

success "🎉 Deployment completed successfully!"

# Summary
echo ""
echo "📋 DEPLOYMENT SUMMARY"
echo "===================="
echo "Backup Location: $BACKUP_DIR"
echo "Log File: $LOG_FILE"
echo "Maintenance Secret: $maintenance_secret"
echo ""
echo "🔧 If issues are detected:"
echo "1. Check diagnostic: php artisan roles:diagnose"
echo "2. Force cache reset: php artisan roles:force-reset-cache --clear-all --rebuild"
echo "3. Visit debug endpoint: /admin/roles/debug"
echo "4. Check application logs: tail -f storage/logs/laravel.log"
echo ""
echo "✅ Role Permission System is now deployed and active!"
