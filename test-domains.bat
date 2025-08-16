@echo off
echo ================================================
echo    Aero-HR XAMPP Domain Test
echo ================================================
echo.
echo Testing domain resolution...
echo.

REM Test central domain
echo 🌐 Testing Central Domain:
nslookup aero-hr.local | findstr "Address:" >nul 2>&1
if %errorLevel% EQU 0 (
    echo ✅ aero-hr.local resolves correctly
) else (
    echo ❌ aero-hr.local NOT resolving
)

REM Test tenant domains
echo.
echo 🏢 Testing Tenant Domains:
set "tenants=dbedc acme techstart globalhr innovate"
for %%t in (%tenants%) do (
    nslookup %%t.aero-hr.local | findstr "Address:" >nul 2>&1
    if !errorLevel! EQU 0 (
        echo ✅ %%t.aero-hr.local resolves correctly
    ) else (
        echo ❌ %%t.aero-hr.local NOT resolving
    )
)

echo.
echo 📋 Quick URLs to test:
echo.
echo Central (SaaS Admin):
echo    http://aero-hr.local
echo    http://aero-hr.local/login
echo    http://aero-hr.local/admin
echo.
echo Tenants:
echo    http://dbedc.aero-hr.local/login
echo    http://acme.aero-hr.local/login  
echo    http://techstart.aero-hr.local/login
echo    http://globalhr.aero-hr.local/login
echo    http://innovate.aero-hr.local/login
echo.
echo 🚀 Copy and paste these URLs into your browser to test!
echo.
pause
