# Roles & Permissions Module - Live Server Deployment Guide

## Overview

This guide covers the deployment of the enhanced Roles & Permissions module that addresses the "0 permissions" issue on live servers while maintaining full functionality in local environments.

## Problem Summary

**Issue**: On the live server, all roles show 0 permissions assigned, but on local environment, permissions display and function correctly.

**Root Causes Identified**:
- Cache inconsistencies between environments
- Database query optimization differences
- Memory/resource limitations on live server
- Frontend data normalization issues

## Solution Components

### 1. Enhanced Backend Services

#### A. RolePermissionService.php
- **Multiple fallback strategies** for data retrieval
- **Auto-repair functionality** for data integrity issues
- **Enhanced caching** with intelligent cache management
- **Environment-aware** error handling

#### B. RoleController.php
- **Retry mechanisms** for failed operations
- **Enhanced error handling** with detailed logging
- **Optimized data retrieval** using service fallbacks

#### C. Middleware (EnsureRolePermissionSync.php)
- **Automatic data validation** on role management routes
- **Self-healing** data integrity checks
- **Performance monitoring** and logging

### 2. Diagnostic Tools

#### A. DiagnoseRolePermissions Command
```bash
php artisan roles:diagnose [--fix] [--clear-cache]
```
- Comprehensive system health check
- Automatic repair capabilities
- Cache integrity validation

#### B. ForceRolePermissionCacheReset Command
```bash
php artisan roles:force-reset-cache [--clear-all] [--rebuild] [--verify]
```
- Emergency cache reset functionality
- Multi-level cache clearing
- Cache integrity verification

#### C. RoleDebugController
- Debug endpoints for live server troubleshooting
- Real-time system status monitoring
- Cache management tools

### 3. Enhanced Frontend

#### A. RoleManagement.jsx
- **Data validation** and error recovery
- **Enhanced error handling** with user feedback
- **Defensive programming** against data inconsistencies
- **Performance optimizations**

## Deployment Instructions

### Prerequisites

1. **Server Access**: SSH or RDP access to live server
2. **Permissions**: Ability to run artisan commands and modify files
3. **Backup**: Database and file backup capabilities
4. **Maintenance**: Ability to put application in maintenance mode

### Option 1: Automated Deployment (Recommended)

#### For Linux/Unix Servers:
```bash
# Make script executable
chmod +x deploy-role-permission-system.sh

# Run deployment
./deploy-role-permission-system.sh
```

#### For Windows Servers:
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run deployment
.\deploy-role-permission-system.ps1
```

### Option 2: Manual Deployment

#### Step 1: Backup Current System
```bash
# Create backup directory
mkdir /tmp/aero-hr-backup-$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u username -p database_name > backup.sql

# Backup critical files
cp -r app/Services/Role /tmp/backup/
cp app/Http/Controllers/RoleController.php /tmp/backup/
```

#### Step 2: Deploy Enhanced Code
```bash
# Upload enhanced files to server
# - app/Services/Role/RolePermissionService.php
# - app/Http/Controllers/RoleController.php
# - app/Http/Controllers/RoleDebugController.php
# - app/Http/Middleware/EnsureRolePermissionSync.php
# - app/Console/Commands/DiagnoseRolePermissions.php
# - app/Console/Commands/ForceRolePermissionCacheReset.php
# - resources/js/Pages/Administration/RoleManagement.jsx
# - routes/web.php (updated with middleware)
# - bootstrap/app.php (middleware registration)
```

#### Step 3: Application Maintenance
```bash
# Put application in maintenance mode
php artisan down --retry=60

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan permission:cache-reset
```

#### Step 4: Install Dependencies & Build
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci --only=production

# Build assets
npm run build
```

#### Step 5: Database & Cache Management
```bash
# Run migrations (if any)
php artisan migrate --force

# Clear and rebuild permission cache
php artisan permission:cache-reset
php artisan roles:force-reset-cache --clear-all --rebuild --verify
```

#### Step 6: System Diagnostics
```bash
# Run comprehensive diagnostic
php artisan roles:diagnose --fix --clear-cache

# Verify system health
php artisan roles:diagnose
```

#### Step 7: Warm Up & Go Live
```bash
# Warm up caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Bring application back online
php artisan up
```

## Post-Deployment Verification

### 1. Basic Health Check
```bash
# Run diagnostic command
php artisan roles:diagnose

# Expected output:
# ✅ All checks passed! Role and permission system appears healthy
```

### 2. Web Interface Verification
1. Navigate to `/admin/roles-management`
2. Verify roles are loaded with permission counts > 0
3. Test permission toggle functionality
4. Check for any error messages or warnings

### 3. Debug Endpoint Check
Visit `/admin/roles/debug` (Super Administrator only) to see:
- System status
- Data counts
- Cache status
- Environment information

### 4. Log Monitoring
```bash
# Monitor application logs
tail -f storage/logs/laravel.log

# Look for:
# - No error messages related to roles/permissions
# - Successful cache operations
# - Proper data retrieval
```

## Troubleshooting

### Issue: Still Showing 0 Permissions

#### Solution 1: Force Cache Reset
```bash
php artisan roles:force-reset-cache --clear-all --rebuild --verify
```

#### Solution 2: Manual Cache Investigation
```bash
# Check cache configuration
php artisan tinker
>>> config('cache.default')
>>> Cache::getStore()

# Test data retrieval
>>> $service = app(\App\Services\Role\RolePermissionService::class);
>>> $data = $service->getRolesWithPermissionsForFrontend();
>>> count($data['roles'])
>>> count($data['permissions'])
>>> count($data['role_has_permissions'])
```

#### Solution 3: Database Verification
```sql
-- Check role-permission relationships
SELECT 
    COUNT(*) as total_relationships,
    COUNT(DISTINCT role_id) as unique_roles,
    COUNT(DISTINCT permission_id) as unique_permissions
FROM role_has_permissions;

-- Check specific role relationships
SELECT r.name, COUNT(rhp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_has_permissions rhp ON r.id = rhp.role_id
GROUP BY r.id, r.name;
```

### Issue: Performance Problems

#### Solution: Enable Query Optimization
```bash
# Enable query optimization in .env
CACHE_DRIVER=redis  # or database if Redis not available
DB_STRICT_MODE=false
DB_ENGINE=InnoDB
```

#### Solution: Database Indexing
```sql
-- Ensure proper indexing
ALTER TABLE role_has_permissions ADD INDEX idx_role_permission (role_id, permission_id);
ALTER TABLE model_has_roles ADD INDEX idx_model_role (model_id, role_id);
ALTER TABLE model_has_permissions ADD INDEX idx_model_permission (model_id, permission_id);
```

### Issue: Memory/Resource Limits

#### Solution: Optimize Configuration
```bash
# In .env file
MEMORY_LIMIT=512M
MAX_EXECUTION_TIME=300

# PHP configuration (php.ini)
memory_limit = 512M
max_execution_time = 300
opcache.enable = 1
opcache.memory_consumption = 128
```

## Emergency Recovery

### Quick Recovery Steps
```bash
# Emergency cache clear and rebuild
php artisan cache:clear
php artisan permission:cache-reset
php artisan roles:force-reset-cache --clear-all --rebuild

# Reset application cache
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart services (if possible)
sudo systemctl restart nginx
sudo systemctl restart php-fpm
```

### Rollback Procedure
```bash
# Restore from backup
cp /tmp/backup/RoleController.php app/Http/Controllers/
cp -r /tmp/backup/Role/ app/Services/

# Clear caches
php artisan cache:clear
php artisan permission:cache-reset

# Restart application
php artisan up
```

## Monitoring & Maintenance

### Daily Health Checks
```bash
# Add to cron (daily at 2 AM)
0 2 * * * cd /path/to/project && php artisan roles:diagnose --fix --clear-cache
```

### Weekly Cache Maintenance
```bash
# Add to cron (weekly on Sunday at 3 AM)
0 3 * * 0 cd /path/to/project && php artisan roles:force-reset-cache --clear-all --rebuild
```

### Log Rotation
```bash
# Ensure Laravel logs are rotated
# Add to logrotate configuration
/path/to/project/storage/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

## Support & Debugging

### Debug Commands Quick Reference
```bash
# Comprehensive system check
php artisan roles:diagnose

# Force cache reset with verification
php artisan roles:force-reset-cache --clear-all --rebuild --verify

# Clear all application caches
php artisan cache:clear && php artisan config:clear && php artisan route:clear

# Test specific role data
php artisan tinker --execute="dump(app(\App\Services\Role\RolePermissionService::class)->getRolesWithPermissionsForFrontend());"
```

### Debug Endpoints
- **System Status**: `GET /admin/roles/debug`
- **Cache Refresh**: `POST /admin/roles/debug/refresh-cache`
- **Role Testing**: `GET /admin/roles/debug/test-role`

### Contact Information
For additional support or if issues persist:
1. Check application logs: `storage/logs/laravel.log`
2. Use debug endpoints for system status
3. Run diagnostic commands for detailed analysis
4. Review server error logs for environment-specific issues

---

## Summary

This enhanced Roles & Permissions system provides:

✅ **Robust fallback mechanisms** for data retrieval  
✅ **Comprehensive diagnostic tools** for troubleshooting  
✅ **Automated repair capabilities** for data integrity  
✅ **Enhanced error handling** with detailed logging  
✅ **Performance optimizations** for production environments  
✅ **Emergency recovery procedures** for critical situations  

The system is designed to work reliably in both local and production environments, with extensive monitoring and self-healing capabilities to prevent the "0 permissions" issue from recurring.
