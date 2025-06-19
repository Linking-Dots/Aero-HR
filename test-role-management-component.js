// Test script to verify Role Management functionality
// This script simulates the data flow between backend and frontend

console.log('Testing Role Management Component Integration...');

// Mock data structure that matches the backend response
const mockRoleData = {
    roles: [
        {
            id: 1,
            name: 'Super Administrator',
            description: 'Full system access',
            hierarchy_level: 1,
            permissions: [
                { id: 1, name: 'read employees', action: 'read' },
                { id: 2, name: 'write employees', action: 'write' },
                { id: 3, name: 'create employees', action: 'create' },
                { id: 4, name: 'delete employees', action: 'delete' }
            ]
        },
        {
            id: 2,
            name: 'Administrator',
            description: 'Administrative access',
            hierarchy_level: 2,
            permissions: [
                { id: 1, name: 'read employees', action: 'read' },
                { id: 2, name: 'write employees', action: 'write' }
            ]
        },
        {
            id: 3,
            name: 'HR Manager',
            description: 'Human resources management',
            hierarchy_level: 3,
            permissions: [
                { id: 1, name: 'read employees', action: 'read' },
                { id: 5, name: 'read leaves', action: 'read' },
                { id: 6, name: 'approve leaves', action: 'approve' }
            ]
        }
    ],
    permissions: [
        { id: 1, name: 'read employees' },
        { id: 2, name: 'write employees' },
        { id: 3, name: 'create employees' },
        { id: 4, name: 'delete employees' },
        { id: 5, name: 'read leaves' },
        { id: 6, name: 'approve leaves' },
        { id: 7, name: 'read attendances' },
        { id: 8, name: 'write attendances' }
    ],
    role_has_permissions: [
        { role_id: 1, permission_id: 1 },
        { role_id: 1, permission_id: 2 },
        { role_id: 1, permission_id: 3 },
        { role_id: 1, permission_id: 4 },
        { role_id: 2, permission_id: 1 },
        { role_id: 2, permission_id: 2 },
        { role_id: 3, permission_id: 1 },
        { role_id: 3, permission_id: 5 },
        { role_id: 3, permission_id: 6 }
    ],
    enterprise_modules: {
        employees: {
            name: 'Employee Management',
            permissions: ['read', 'write', 'create', 'delete'],
            category: 'human_resources'
        },
        leaves: {
            name: 'Leave Management',
            permissions: ['read', 'write', 'approve', 'reject'],
            category: 'human_resources'
        },
        attendances: {
            name: 'Attendance Management',
            permissions: ['read', 'write', 'create', 'delete'],
            category: 'human_resources'
        }
    },
    user_hierarchy_level: 2,
    assignable_roles: ['HR Manager', 'Employee', 'Team Lead']
};

// Test permission grouping logic
function groupPermissionsByModule(permissions) {
    return permissions.reduce((acc, permission) => {
        const parts = permission.name.split(' ');
        const action = parts[0];
        const module = parts.slice(1).join(' ');
        
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push({ ...permission, action });
        return acc;
    }, {});
}

// Test role permission checking
function roleHasPermission(roleId, permissionName, rolePermissions, permissions) {
    const rolePerms = rolePermissions.filter(rp => rp.role_id === roleId);
    const permission = permissions.find(p => p.name === permissionName);
    return permission && rolePerms.some(rp => rp.permission_id === permission.id);
}

// Run tests
console.log('1. Testing permission grouping...');
const groupedPermissions = groupPermissionsByModule(mockRoleData.permissions);
console.log('Grouped permissions:', groupedPermissions);

console.log('2. Testing role permission checking...');
const hasPermission = roleHasPermission(1, 'read employees', mockRoleData.role_has_permissions, mockRoleData.permissions);
console.log('Super Admin has read employees permission:', hasPermission);

console.log('3. Testing hierarchy levels...');
mockRoleData.roles.forEach(role => {
    const canManage = role.hierarchy_level > mockRoleData.user_hierarchy_level;
    console.log(`Can manage ${role.name}:`, canManage);
});

console.log('4. Testing module permission counts...');
Object.entries(groupedPermissions).forEach(([module, modulePermissions]) => {
    const roleId = 3; // HR Manager
    const granted = modulePermissions.filter(p => 
        roleHasPermission(roleId, p.name, mockRoleData.role_has_permissions, mockRoleData.permissions)
    ).length;
    console.log(`HR Manager - ${module}: ${granted}/${modulePermissions.length} permissions`);
});

console.log('Role Management Component Integration Test Complete!');

export default mockRoleData;
