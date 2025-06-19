# Role Management Component Documentation

## Overview

The new Role Management component (`resources/js/Pages/Administration/RoleManagement.jsx`) provides a modern, glassmorphism-styled interface for managing roles and permissions in the Aero-HR system. It follows Hero UI design patterns and integrates seamlessly with the existing backend infrastructure.

## Features

### 🎨 Design Features
- **Glassmorphism UI**: Follows the project's glass card aesthetic with blur effects and transparency
- **Hero UI Components**: Uses Material-UI components styled to match the project's design system
- **Responsive Layout**: Split-panel design with roles sidebar and permissions main panel
- **Modern Icons**: Uses Heroicons for consistent iconography

### 🔧 Functional Features
- **Real-time Permission Management**: Toggle individual permissions or entire modules
- **Role CRUD Operations**: Create, edit, delete roles with validation
- **Hierarchy-based Access**: Respects user hierarchy levels for security
- **Module-based Grouping**: Permissions organized by enterprise modules
- **Search and Filter**: Find permissions quickly with search functionality
- **Bulk Operations**: Toggle entire modules of permissions at once

## Component Structure

```
RoleManagement.jsx
├── Role Sidebar (Left Panel)
│   ├── Role List with avatars
│   ├── Permission counts
│   ├── Edit/Delete buttons
│   └── System role indicators
└── Permissions Panel (Right Panel)
    ├── Search functionality
    ├── Module accordions
    ├── Permission checkboxes
    └── Module toggle switches
```

## Backend Integration

### Endpoints Used
- `GET /admin/roles-management` - Main interface (handled by `RoleController@index`)
- `POST /admin/roles/update-permission` - Toggle individual permissions
- `POST /admin/roles/update-module` - Toggle module permissions
- `POST /admin/roles` - Create new role
- `PUT /admin/roles/{id}` - Update existing role
- `DELETE /admin/roles/{id}` - Delete role

### Data Flow
1. **Initial Load**: Controller provides roles, permissions, and relationships
2. **Permission Toggle**: AJAX requests update backend and local state
3. **Role Management**: CRUD operations sync with Spatie Permission package
4. **Real-time Updates**: Local state management ensures UI responsiveness

## Usage Guide

### For Administrators

1. **Access the Interface**
   - Navigate to `/admin/roles-management`
   - Requires `Super Administrator` or `Administrator` role

2. **Select a Role**
   - Click on any role in the left sidebar
   - View current permissions in the main panel

3. **Manage Permissions**
   - **Individual**: Click checkboxes to toggle specific permissions
   - **Module-wide**: Use the switch in module headers to toggle all permissions
   - **Search**: Use the search bar to find specific permissions

4. **Create New Role**
   - Click "Create Role" button
   - Fill in name, description, and hierarchy level
   - Permissions can be assigned after creation

5. **Edit Existing Role**
   - Click the edit icon next to any manageable role
   - Update details in the dialog
   - System roles (Super Administrator) cannot be edited

6. **Delete Role**
   - Click the delete icon next to any manageable role
   - Confirm deletion in the dialog
   - Roles assigned to users cannot be deleted

### Permission Structure

Permissions follow the pattern: `{action} {module}`

**Standard Actions:**
- `read` - View access
- `write` - Modify existing records
- `create` - Add new records
- `delete` - Remove records
- `import` - Import data
- `export` - Export data
- `approve` - Approval workflows
- `reject` - Rejection workflows

**Module Examples:**
- `employees` - Employee management
- `leaves` - Leave management
- `attendances` - Attendance tracking
- `departments` - Department structure
- `holidays` - Holiday calendar

## Security Features

### Hierarchy-based Access Control
- Users can only manage roles below their hierarchy level
- Prevents privilege escalation
- System roles are protected from modification

### Validation
- Role names must be unique
- Hierarchy levels must be appropriate
- Permission assignments are validated server-side

### Audit Trail
- All role changes are logged
- Permission modifications tracked
- User actions recorded for compliance

## Styling Guide

### Glass Card Theme
The component uses the project's glass card styling:

```javascript
// Theme configuration
glassCard: {
    backdropFilter: 'blur(24px) saturate(180%)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.10) 100%)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
    borderRadius: '28px'
}
```

### Color Scheme
- **Primary**: Blue gradient (`#667eea` to `#764ba2`)
- **Success**: Green for granted permissions
- **Warning**: Orange for partial module access
- **Error**: Red for delete actions
- **Glass**: Semi-transparent whites and blues

## Integration with Existing System

### Middleware Compatibility
- Works with existing role-based middleware
- Respects route protection
- Integrates with Spatie Permission package

### Data Consistency
- Uses existing database structure
- Maintains referential integrity
- Syncs with user role assignments

### Performance Considerations
- Lazy loading of permissions
- Efficient state management
- Optimized re-renders with React hooks

## Troubleshooting

### Common Issues

1. **Permissions not updating**
   - Check network requests in browser dev tools
   - Verify user has appropriate hierarchy level
   - Ensure role is not a system role

2. **Glass styling not appearing**
   - Verify theme provider is properly configured
   - Check Material-UI theme setup
   - Ensure CSS backdrop-filter support

3. **Role creation failing**
   - Check hierarchy level validation
   - Verify role name uniqueness
   - Ensure required fields are filled

### Debug Mode
Add to component for debugging:
```javascript
console.log('Roles:', roles);
console.log('Active Role:', activeRole);
console.log('Selected Permissions:', selectedPermissions);
```

## Future Enhancements

### Planned Features
- Permission templates for quick role setup
- Bulk role operations (clone, merge, etc.)
- Advanced filtering and sorting
- Role usage analytics
- Export/import role configurations

### API Extensions
- WebSocket support for real-time updates
- Bulk permission assignment endpoints
- Role comparison utilities
- Permission impact analysis

## Support

For technical support or feature requests related to the Role Management component:

1. Check the backend logs in `storage/logs/laravel.log`
2. Verify database integrity with role and permission tables
3. Test with browser developer tools for frontend issues
4. Consult the RolePermissionService for business logic

## File Locations

- **Component**: `resources/js/Pages/Administration/RoleManagement.jsx`
- **Controller**: `app/Http/Controllers/RoleController.php`
- **Service**: `app/Services/Role/RolePermissionService.php`
- **Routes**: `routes/web.php` (lines 174-193)
- **Test Data**: `test-role-management-component.js`
