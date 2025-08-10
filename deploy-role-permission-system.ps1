# Aero-HR Role Permission System Deployment Script (PowerShell)
# This script handles the deployment of the enhanced role-permission system to live server

param(
    [switch]$SkipBackup = $false,
    [switch]$SkipMaintenance = $false,
    [string]$BackupPath = ""
)

# Configuration
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$defaultBackupDir = "C:\temp\aero-hr-backup-$timestamp"
$backupDir = if ($BackupPath) { $BackupPath } else { $defaultBackupDir }
$logFile = "C:\temp\aero-hr-deployment-$timestamp.log"

# Colors and formatting
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoNewline
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    # Write to console with color
    if ($NoNewline) {
        Write-Host $logMessage -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $logMessage -ForegroundColor $Color
    }
    
    # Write to log file
    Add-Content -Path $logFile -Value $logMessage
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput -Message "[SUCCESS] $Message" -Color "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput -Message "[ERROR] $Message" -Color "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput -Message "[WARNING] $Message" -Color "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput -Message "[INFO] $Message" -Color "Cyan"
}

# Function to check if command exists
function Test-CommandExists {
    param([string]$Command)
    
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Error handling
$ErrorActionPreference = "Stop"
trap {
    Write-Error "Deployment failed: $_"
    
    # Attempt to bring application back online if it was in maintenance mode
    if (Test-Path "artisan") {
        Write-Info "Attempting to bring application back online..."
        try {
            php artisan up
            Write-Success "Application brought back online"
        } catch {
            Write-Error "Failed to bring application back online: $_"
        }
    }
    
    exit 1
}

Write-Info "🚀 Starting Aero-HR Role Permission System Deployment..."

# Pre-deployment checks
Write-Info "🔍 Running pre-deployment checks..."

if (-not (Test-CommandExists "php")) {
    Write-Error "PHP is not installed or not in PATH"
    exit 1
}

if (-not (Test-CommandExists "composer")) {
    Write-Error "Composer is not installed or not in PATH"
    exit 1
}

if (-not (Test-CommandExists "npm")) {
    Write-Error "NPM is not installed or not in PATH"
    exit 1
}

# Check if we're in a Laravel project
if (-not (Test-Path "artisan")) {
    Write-Error "This doesn't appear to be a Laravel project root directory"
    exit 1
}

Write-Success "Pre-deployment checks passed"

# Step 1: Create backup
if (-not $SkipBackup) {
    Write-Info "📦 Creating backup..."
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    # Backup database
    if (Test-Path ".env") {
        $envContent = Get-Content ".env"
        $dbName = ($envContent | Where-Object { $_ -match "^DB_DATABASE=" }) -replace "DB_DATABASE=", ""
        $dbUser = ($envContent | Where-Object { $_ -match "^DB_USERNAME=" }) -replace "DB_USERNAME=", ""
        $dbPass = ($envContent | Where-Object { $_ -match "^DB_PASSWORD=" }) -replace "DB_PASSWORD=", ""
        
        if ($dbName) {
            Write-Info "Backing up database: $dbName"
            try {
                $dumpFile = Join-Path $backupDir "database.sql"
                $mysqldumpArgs = @("-u$dbUser", "-p$dbPass", $dbName)
                mysqldump @mysqldumpArgs | Out-File -FilePath $dumpFile -Encoding UTF8
                Write-Success "Database backup created"
            } catch {
                Write-Warning "Database backup failed: $_"
            }
        }
    }
    
    # Backup critical files
    try {
        if (Test-Path "app\Services\Role") {
            Copy-Item -Path "app\Services\Role" -Destination "$backupDir\Role_Service_OLD" -Recurse -Force
        }
        if (Test-Path "app\Http\Controllers\RoleController.php") {
            Copy-Item -Path "app\Http\Controllers\RoleController.php" -Destination "$backupDir\RoleController_OLD.php" -Force
        }
        if (Test-Path "resources\js\Pages\Administration\RoleManagement.jsx") {
            Copy-Item -Path "resources\js\Pages\Administration\RoleManagement.jsx" -Destination "$backupDir\RoleManagement_OLD.jsx" -Force
        }
    } catch {
        Write-Warning "Some file backups failed: $_"
    }
    
    Write-Success "Backup created at: $backupDir"
}

# Step 2: Put application in maintenance mode
if (-not $SkipMaintenance) {
    Write-Info "🔧 Putting application in maintenance mode..."
    $maintenanceSecret = "aero-hr-deployment-$(Get-Date -UFormat %s)"
    php artisan down --retry=60 --secret=$maintenanceSecret
    Write-Success "Application in maintenance mode (secret: $maintenanceSecret)"
}

try {
    # Step 3: Clear all caches
    Write-Info "🧹 Clearing all caches..."
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan permission:cache-reset
    Write-Success "Caches cleared"
    
    # Step 4: Install/update dependencies
    Write-Info "📦 Installing dependencies..."
    composer install --no-dev --optimize-autoloader
    npm ci --only=production
    Write-Success "Dependencies installed"
    
    # Step 5: Build assets
    Write-Info "🏗️ Building production assets..."
    npm run build
    Write-Success "Assets built"
    
    # Step 6: Run migrations (if any)
    Write-Info "🗄️ Running database migrations..."
    php artisan migrate --force
    Write-Success "Migrations completed"
    
    # Step 7: Clear and rebuild permission cache
    Write-Info "🔄 Rebuilding permission cache..."
    php artisan permission:cache-reset
    php artisan roles:force-reset-cache --clear-all --rebuild --verify
    Write-Success "Permission cache rebuilt"
    
    # Step 8: Run diagnostic checks
    Write-Info "🔍 Running system diagnostics..."
    $diagnosticResult = php artisan roles:diagnose --fix --clear-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Success "System diagnostics passed"
    } else {
        Write-Warning "System diagnostics completed with warnings - check logs"
    }
    
    # Step 9: Warm up caches
    Write-Info "🔥 Warming up application caches..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    Write-Success "Caches warmed up"
    
    # Step 10: Set proper permissions (Windows equivalent)
    Write-Info "🔐 Setting file permissions..."
    try {
        # Grant IIS_IUSRS full control to storage and bootstrap/cache
        icacls "storage" /grant "IIS_IUSRS:(OI)(CI)F" /T | Out-Null
        icacls "bootstrap\cache" /grant "IIS_IUSRS:(OI)(CI)F" /T | Out-Null
        Write-Success "File permissions set"
    } catch {
        Write-Warning "Setting file permissions failed: $_"
    }

} finally {
    # Step 11: Bring application back online
    if (-not $SkipMaintenance) {
        Write-Info "🌟 Bringing application back online..."
        php artisan up
        Write-Success "Application is now online"
    }
}

# Step 12: Final verification
Write-Info "✅ Running final verification..."

# Test role permission endpoint
Write-Info "Testing role permission endpoint..."
$testScript = @'
$service = app(\App\Services\Role\RolePermissionService::class);
$data = $service->getRolesWithPermissionsForFrontend();
echo 'Roles: ' . count($data['roles']) . PHP_EOL;
echo 'Permissions: ' . count($data['permissions']) . PHP_EOL;
echo 'Relationships: ' . count($data['role_has_permissions']) . PHP_EOL;
if (count($data['roles']) > 0 && count($data['permissions']) > 0 && count($data['role_has_permissions']) > 0) {
    echo 'SUCCESS: All data loaded correctly' . PHP_EOL;
} else {
    echo 'WARNING: Data seems incomplete' . PHP_EOL;
}
'@

try {
    php artisan tinker --execute=$testScript
} catch {
    Write-Warning "Final verification test failed: $_"
}

# Summary
Write-Info ""
Write-Info "📋 DEPLOYMENT SUMMARY"
Write-Info "===================="
Write-Info "Backup Location: $backupDir"
Write-Info "Log File: $logFile"
Write-Info ""
Write-Info "🔧 If issues are detected:"
Write-Info "1. Check diagnostic: php artisan roles:diagnose"
Write-Info "2. Force cache reset: php artisan roles:force-reset-cache --clear-all --rebuild"
Write-Info "3. Visit debug endpoint: /admin/roles/debug"
Write-Info "4. Check application logs: Get-Content storage\logs\laravel.log -Tail 50"
Write-Info ""
Write-Success "✅ Role Permission System is now deployed and active!"

Write-Info "🔧 Debug endpoints available at:"
Write-Info "  - /admin/roles/debug (system status)"
Write-Info "  - /admin/roles/debug/refresh-cache (clear cache)"
Write-Info "  - Artisan commands:"
Write-Info "    - php artisan roles:diagnose (comprehensive check)"
Write-Info "    - php artisan roles:force-reset-cache --clear-all --rebuild (emergency cache reset)"
