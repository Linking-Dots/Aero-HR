# Multi-Tenant Migration Organization Plan

## Current Issues
- All existing migrations are in root `migrations/` folder 
- These are single-company business logic tables
- They need to be moved to `tenant/` folder to run for each new tenant
- Some recent migrations are already trying to modify `plans` and `subscriptions` tables that should be platform-only

## Migration Categories

### 1. PLATFORM MIGRATIONS (Stay in `platform/` folder)
- Tenants, domains, plans, subscriptions management
- Platform users/admins
- Billing and subscription tracking
- Tenant user lookup

### 2. TENANT MIGRATIONS (Move to `tenant/` folder)  
- All business application tables (users, departments, projects, etc.)
- HR, CRM, inventory, POS, LMS, SCM modules
- Tenant-specific settings and data

### 3. LEGACY/CLEANUP (Remove or consolidate)
- Old tenant/plan table modifications that conflict with new structure
- Duplicate or conflicting migrations

## Action Plan

1. **Move business logic migrations** to `tenant/` folder
2. **Remove conflicting migrations** that try to modify platform tables
3. **Clean up the existing tenant structure**
4. **Create proper tenant base migration**

## Migrations to Remove/Fix
- `2025_08_14_223555_add_stripe_fields_to_subscriptions_table.php` (conflicts with new subscriptions structure)
- `2025_08_14_223708_add_description_and_stripe_fields_to_plans_table.php` (conflicts with new plans structure)

## Tenant Migrations Organization
Will be organized by module:
- `000x_` - Core tenant setup (users, departments, roles)
- `001x_` - HR modules  
- `002x_` - CRM modules
- `003x_` - Inventory/POS modules
- `004x_` - LMS modules
- `005x_` - SCM modules
- `006x_` - Analytics/reporting
- `007x_` - Project management
- etc.
