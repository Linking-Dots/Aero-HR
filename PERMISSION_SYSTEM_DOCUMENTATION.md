# Aero-HR Permission System Documentation

## Overview
This document outlines the comprehensive permission system implemented in the Aero-HR application using Spatie Permission package with a standardized naming convention.

## Permission Naming Convention
All permissions follow the format: `{resource}.{action}[.{scope}]`

### Examples:
- `employees.view` - View employees
- `employees.create` - Create new employees
- `employees.update` - Edit employee information
- `employees.delete` - Delete employees
- `attendance.own.view` - View own attendance records
- `leave.own.create` - Create own leave requests

## Module Structure

### 1. Core System
**Module Key**: `core`
**Permissions**:
- `dashboard.view` - Access main dashboard
- `stats.view` - View system statistics
- `updates.view` - View system updates

### 2. Self Service Portal
**Module Key**: `self-service`
**Permissions**:
- `attendance.own.view` - View own attendance
- `attendance.own.punch` - Punch in/out
- `leave.own.view` - View own leave records
- `leave.own.create` - Create leave requests
- `leave.own.update` - Edit own leave requests
- `leave.own.delete` - Delete own leave requests
- `communications.own.view` - View own communications
- `profile.own.view` - View own profile
- `profile.own.update` - Update own profile
- `profile.password.change` - Change own password

### 3. Human Resource Management
**Module Key**: `hrm`
**Permissions**:
- `employees.view` - View employees
- `employees.create` - Create employees
- `employees.update` - Update employees
- `employees.delete` - Delete employees
- `employees.import` - Import employee data
- `employees.export` - Export employee data
- `departments.view` - View departments
- `departments.create` - Create departments
- `departments.update` - Update departments
- `departments.delete` - Delete departments
- `designations.view` - View designations
- `designations.create` - Create designations
- `designations.update` - Update designations
- `designations.delete` - Delete designations
- `attendance.view` - View all attendance
- `attendance.create` - Create attendance records
- `attendance.update` - Update attendance records
- `attendance.delete` - Delete attendance records
- `attendance.import` - Import attendance data
- `attendance.export` - Export attendance data
- `holidays.view` - View holidays
- `holidays.create` - Create holidays
- `holidays.update` - Update holidays
- `holidays.delete` - Delete holidays
- `leaves.view` - View all leaves
- `leaves.create` - Create leaves
- `leaves.update` - Update leaves
- `leaves.delete` - Delete leaves
- `leaves.approve` - Approve leaves
- `leaves.analytics` - View leave analytics
- `leave-settings.view` - View leave settings
- `leave-settings.update` - Update leave settings
- `jurisdiction.view` - View jurisdictions
- `jurisdiction.create` - Create jurisdictions
- `jurisdiction.update` - Update jurisdictions
- `jurisdiction.delete` - Delete jurisdictions

### 4. Project & Portfolio Management
**Module Key**: `ppm`
**Permissions**:
- `daily-works.view` - View daily works
- `daily-works.create` - Create daily works
- `daily-works.update` - Update daily works
- `daily-works.delete` - Delete daily works
- `daily-works.import` - Import daily work data
- `daily-works.export` - Export daily work data
- `projects.analytics` - View project analytics
- `tasks.view` - View tasks
- `tasks.create` - Create tasks
- `tasks.update` - Update tasks
- `tasks.delete` - Delete tasks
- `tasks.assign` - Assign tasks
- `reports.view` - View reports
- `reports.create` - Create reports
- `reports.update` - Update reports
- `reports.delete` - Delete reports

### 5. Document & Knowledge Management
**Module Key**: `dms`
**Permissions**:
- `letters.view` - View letters
- `letters.create` - Create letters
- `letters.update` - Update letters
- `letters.delete` - Delete letters
- `documents.view` - View documents
- `documents.create` - Create documents
- `documents.update` - Update documents
- `documents.delete` - Delete documents

### 6. Customer Relationship Management (Future)
**Module Key**: `crm`
**Permissions**:
- `customers.view` - View customers
- `customers.create` - Create customers
- `customers.update` - Update customers
- `customers.delete` - Delete customers
- `leads.view` - View leads
- `leads.create` - Create leads
- `leads.update` - Update leads
- `leads.delete` - Delete leads
- `feedback.view` - View feedback
- `feedback.create` - Create feedback
- `feedback.update` - Update feedback
- `feedback.delete` - Delete feedback

### 7. Supply Chain & Inventory Management (Future)
**Module Key**: `scm`
**Permissions**:
- `inventory.view` - View inventory
- `inventory.create` - Create inventory items
- `inventory.update` - Update inventory
- `inventory.delete` - Delete inventory items
- `suppliers.view` - View suppliers
- `suppliers.create` - Create suppliers
- `suppliers.update` - Update suppliers
- `suppliers.delete` - Delete suppliers
- `purchase-orders.view` - View purchase orders
- `purchase-orders.create` - Create purchase orders
- `purchase-orders.update` - Update purchase orders
- `purchase-orders.delete` - Delete purchase orders
- `warehousing.view` - View warehouse operations
- `warehousing.manage` - Manage warehouse operations

### 8. Retail & Sales Operations (Future)
**Module Key**: `retail`
**Permissions**:
- `pos.view` - View POS system
- `pos.operate` - Operate POS system
- `sales.view` - View sales data
- `sales.create` - Create sales records
- `sales.analytics` - View sales analytics

### 9. Financial Management & Accounting (Future)
**Module Key**: `finance`
**Permissions**:
- `accounts-payable.view` - View accounts payable
- `accounts-payable.manage` - Manage accounts payable
- `accounts-receivable.view` - View accounts receivable
- `accounts-receivable.manage` - Manage accounts receivable
- `ledger.view` - View ledger
- `ledger.manage` - Manage ledger
- `financial-reports.view` - View financial reports
- `financial-reports.create` - Create financial reports

### 10. System Administration
**Module Key**: `admin`
**Permissions**:
- `users.view` - View users
- `users.create` - Create users
- `users.update` - Update users
- `users.delete` - Delete users
- `users.impersonate` - Impersonate users
- `roles.view` - View roles
- `roles.create` - Create roles
- `roles.update` - Update roles
- `roles.delete` - Delete roles
- `permissions.assign` - Assign permissions
- `settings.view` - View settings
- `settings.update` - Update settings
- `company.settings` - Manage company settings
- `attendance.settings` - Manage attendance settings
- `email.settings` - Manage email settings
- `notification.settings` - Manage notification settings
- `theme.settings` - Manage theme settings
- `localization.settings` - Manage localization settings
- `performance.settings` - Manage performance settings
- `approval.settings` - Manage approval settings
- `invoice.settings` - Manage invoice settings
- `salary.settings` - Manage salary settings
- `system.settings` - Manage system settings
- `audit.view` - View audit logs
- `audit.export` - Export audit logs
- `backup.create` - Create backups
- `backup.restore` - Restore backups

## Default Roles

### 1. Super Administrator
**Description**: Full system access with all permissions
**Permissions**: All permissions (139 total)

### 2. Administrator
**Description**: Administrative access with limited super admin functions
**Permissions**: All permissions except user impersonation and system backups

### 3. Department Manager
**Description**: Departmental management capabilities
**Key Permissions**: 
- All HRM permissions
- Department and employee management
- Leave approval
- Attendance management

### 4. HR Manager
**Description**: Human resources management
**Key Permissions**:
- Employee lifecycle management
- Leave and attendance management
- HR analytics and reporting

### 5. Project Manager
**Description**: Project and portfolio management
**Key Permissions**:
- Project management
- Task assignment and tracking
- Team coordination
- Project reporting

### 6. Finance Manager
**Description**: Financial operations management
**Key Permissions**:
- Financial reporting
- Account management
- Budget oversight

### 7. Team Lead
**Description**: Team leadership and coordination
**Key Permissions**:
- Team member management
- Task assignment
- Progress tracking
- Basic reporting

### 8. Supervisor
**Description**: Supervisory oversight
**Key Permissions**:
- Employee supervision
- Attendance monitoring
- Leave approval (limited)

### 9. Accountant
**Description**: Financial record keeping
**Key Permissions**:
- Financial data entry
- Report generation
- Account reconciliation

### 10. Employee
**Description**: Basic employee access
**Key Permissions**:
- Self-service portal access
- Own profile management
- Own attendance and leave management

## Implementation Files

### Backend Files:
- `app/Services/Role/RolePermissionService.php` - Core permission service
- `app/Http/Controllers/RoleController.php` - Role management controller
- `database/seeders/ComprehensiveRolePermissionSeeder.php` - Permission and role seeder
- `database/migrations/2025_06_21_002703_drop_and_recreate_permission_tables.php` - Permission tables migration
- `app/Console/Commands/AssignUserRoles.php` - User role assignment command

### Frontend Files:
- `resources/js/Props/pages.jsx` - Navigation with permission checks
- `resources/js/Pages/Administration/RoleManagement.jsx` - Role management interface

### Middleware:
- `app/Http/Middleware/CheckPermission.php` - Permission checking middleware
- `app/Http/Middleware/PermissionMiddleware.php` - Enhanced permission middleware

## Usage Examples

### In Controllers:
```php
// Check permission
if (!auth()->user()->can('employees.view')) {
    abort(403, 'Unauthorized');
}

// Assign permission to role
$role->givePermissionTo('employees.create');
```

### In Blade/React Components:
```php
// Check in Blade
@can('employees.view')
    <a href="{{ route('employees.index') }}">View Employees</a>
@endcan
```

```javascript
// Check in React
{permissions.includes('employees.view') && (
    <Link href={route('employees.index')}>View Employees</Link>
)}
```

### In Routes:
```php
Route::middleware(['auth', 'permission:employees.view'])
    ->get('/employees', [EmployeeController::class, 'index']);
```

## Migration Guide

### From Old System:
1. **Old Format**: `read employees` → **New Format**: `employees.view`
2. **Old Format**: `create employees` → **New Format**: `employees.create`
3. **Old Format**: `update employees` → **New Format**: `employees.update`
4. **Old Format**: `delete employees` → **New Format**: `employees.delete`

### Migration Steps:
1. Run the migration to recreate permission tables
2. Run the comprehensive seeder to populate new permissions and roles
3. Assign users to appropriate roles using the AssignUserRoles command
4. Update any custom code to use new permission names

## Maintenance

### Adding New Permissions:
1. Add to the appropriate module in `RolePermissionService.php`
2. Update the seeder to include the new permission
3. Run the seeder to add the permission to the database
4. Assign the permission to appropriate roles

### Adding New Roles:
1. Define the role in the seeder with appropriate permissions
2. Run the seeder to create the role
3. Update any role-specific logic in the application

## Security Considerations

1. **Principle of Least Privilege**: Users should only have the minimum permissions necessary
2. **Regular Audits**: Periodically review user permissions and roles
3. **Permission Inheritance**: Some permissions may imply others (e.g., update may require view)
4. **Sensitive Operations**: Critical operations should require additional authentication
5. **Audit Logging**: All permission changes should be logged for compliance

## Troubleshooting

### Common Issues:
1. **Permission Not Found**: Ensure the permission exists in the database
2. **Cache Issues**: Clear the permission cache after changes
3. **Role Assignment**: Verify users have the correct roles assigned
4. **Frontend Sync**: Ensure frontend permission checks match backend permissions

### Debugging Commands:
```bash
# Clear permission cache
php artisan permission:cache-reset

# List all permissions
php artisan permission:show

# Check user permissions
php artisan tinker
User::find(1)->getAllPermissions()
```

---

*Last Updated: June 21, 2025*
*Version: 1.0*
