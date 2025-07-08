@echo off
echo Aero-HR Setup Script
echo ===================
echo.

REM Check for composer
where composer >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Composer is not installed or not in your PATH.
    echo Please install Composer and try again.
    exit /b 1
)

REM Check for PHP
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: PHP is not installed or not in your PATH.
    echo Please install PHP and try again.
    exit /b 1
)

echo Installing Composer dependencies...
composer install

echo Preparing environment...
if not exist .env (
    copy .env.example .env
    php artisan key:generate
)

echo.
echo Setup options:
echo 1. Full setup (fresh install - WARNING: drops all tables)
echo 2. Update existing setup (migrations + seeds)
echo 3. Run seeders only (no migrations)
echo 4. Exit
echo.

set /p option=Enter option (1-4): 

if "%option%"=="1" (
    php artisan app:setup --fresh
) else if "%option%"=="2" (
    php artisan app:setup
) else if "%option%"=="3" (
    php artisan app:setup --seed
) else if "%option%"=="4" (
    echo Setup cancelled.
    exit /b 0
) else (
    echo Invalid option selected.
    exit /b 1
)

echo.
echo Setup completed!
echo You can now run the application with: php artisan serve
echo.
