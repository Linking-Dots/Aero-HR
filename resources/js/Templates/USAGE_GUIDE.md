# Template Usage Guide - Aero-HR

## Quick Start

### 1. Basic Admin Management Page

```jsx
import { AdminManagementTemplate } from '@/Templates';
import { CalendarIcon } from '@heroicons/react/24/outline';

const MyAdminPage = ({ data, auth }) => {
    const stats = [
        { label: 'Total Items', value: 150, color: 'primary', icon: CalendarIcon },
        { label: 'Pending', value: 25, color: 'warning', icon: ClockIcon },
        { label: 'Approved', value: 100, color: 'success', icon: CheckIcon },
        { label: 'Rejected', value: 25, color: 'danger', icon: XMarkIcon }
    ];

    const filters = [
        {
            type: 'search',
            label: 'Search',
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: 'Search items...'
        },
        {
            type: 'select',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' }
            ]
        }
    ];

    return (
        <AdminManagementTemplate
            title="Item Management"
            pageTitle="Manage Items"
            pageDescription="View and manage all items in the system"
            pageIcon={CalendarIcon}
            quickStats={stats}
            filters={filters}
            primaryPermission="items.view"
        >
            {/* Your table or content here */}
        </AdminManagementTemplate>
    );
};
```

### 2. Basic Employee View Page

```jsx
import { EmployeeViewTemplate } from '@/Templates';

const MyEmployeePage = ({ data, auth }) => {
    const summaryCards = [
        { title: 'My Total', value: 20, color: 'primary' },
        { title: 'This Month', value: 5, color: 'success' }
    ];

    return (
        <EmployeeViewTemplate
            title="My Items"
            pageTitle="My Items"
            pageDescription="View your personal items"
            summaryCards={summaryCards}
            primaryPermission="items.own.view"
        >
            {/* Your content here */}
        </EmployeeViewTemplate>
    );
};
```

### 3. Form with FormTemplate

```jsx
import { FormTemplate, FormSection, FormFieldGroup } from '@/Templates';
import { Input, Select, Textarea } from '@heroui/react';

const MyFormPage = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        setLoading(true);
        try {
            // Submit logic here
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormTemplate
            title="Create New Item"
            description="Fill out the form to create a new item"
            icon={PlusIcon}
            onSubmit={handleSubmit}
            loading={loading}
            validation={errors}
            isDirty={Object.keys(formData).length > 0}
        >
            <FormSection title="Basic Information">
                <FormFieldGroup columns={2}>
                    <Input
                        label="Item Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name}
                        isRequired
                    />
                    <Select
                        label="Category"
                        value={formData.category || ''}
                        onChange={(value) => setFormData({...formData, category: value})}
                    >
                        <SelectItem key="cat1">Category 1</SelectItem>
                        <SelectItem key="cat2">Category 2</SelectItem>
                    </Select>
                </FormFieldGroup>
                
                <Textarea
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </FormSection>
        </FormTemplate>
    );
};
```

### 4. Modal Usage

```jsx
import { ModalTemplate, ConfirmationModal, FormModal } from '@/Templates';

const MyComponent = () => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Basic Modal
    const basicModal = (
        <ModalTemplate
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Item Details"
            subtitle="View detailed information"
            icon={InformationCircleIcon}
            actions={[
                { label: 'Close', variant: 'bordered', onPress: () => setShowModal(false) }
            ]}
        >
            <p>Modal content goes here...</p>
        </ModalTemplate>
    );

    // Confirmation Modal
    const confirmModal = (
        <ConfirmationModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={handleDelete}
            title="Delete Item"
            message="Are you sure you want to delete this item? This action cannot be undone."
            confirmText="Delete"
            confirmColor="danger"
        />
    );

    return (
        <div>
            {/* Your component content */}
            {basicModal}
            {confirmModal}
        </div>
    );
};
```

### 5. Dashboard Layout

```jsx
import { DashboardTemplate, DashboardWidget } from '@/Templates';

const MyDashboard = ({ stats, auth }) => {
    const quickStats = [
        { label: 'Total Users', value: 1250, trend: 'up', change: '+12%' },
        { label: 'Active Today', value: 180, trend: 'up', change: '+5%' }
    ];

    const widgets = [
        {
            title: 'Recent Activity',
            subtitle: 'Last 7 days',
            icon: ChartBarIcon,
            content: <RecentActivityChart />,
            size: { xs: 12, md: 6 },
            refreshable: true
        },
        {
            title: 'Quick Actions',
            content: <QuickActionsList />,
            size: { xs: 12, md: 6 }
        }
    ];

    return (
        <DashboardTemplate
            title="Dashboard"
            pageTitle="Welcome Back!"
            pageSubtitle="Here's what's happening today"
            quickStats={quickStats}
            widgets={widgets}
            onRefresh={handleRefresh}
            permissions={auth.permissions}
        />
    );
};
```

### 6. Data Table Integration

```jsx
import { DataTableTemplate } from '@/Templates';

const MyDataTable = ({ data, pagination }) => {
    const columns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <img src={row.avatar} className="w-8 h-8 rounded-full" />
                    <span>{value}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <StatusChip status={value} type="leave" />
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_, row) => (
                <Button size="sm" onPress={() => handleEdit(row)}>
                    Edit
                </Button>
            )
        }
    ];

    const bulkActions = [
        {
            label: 'Approve Selected',
            color: 'success',
            icon: CheckIcon,
            onPress: handleBulkApprove
        },
        {
            label: 'Delete Selected',
            color: 'danger',
            icon: TrashIcon,
            onPress: handleBulkDelete
        }
    ];

    return (
        <DataTableTemplate
            data={data}
            columns={columns}
            isSelectable={true}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            pagination={pagination}
            onPageChange={handlePageChange}
            bulkActions={bulkActions}
            itemLabel="item"
            renderMobileCard={(item) => (
                <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <StatusChip status={item.status} type="leave" />
                </div>
            )}
        />
    );
};
```

## Advanced Usage

### Custom Styling and Theming

```jsx
// Using custom CSS classes
<AdminManagementTemplate
    className="custom-admin-page"
    // ... other props
>
    <div className="custom-content">
        {/* Content */}
    </div>
</AdminManagementTemplate>

// Custom theme colors via props
const customStats = [
    { 
        label: 'Custom Stat', 
        value: 100, 
        color: 'purple',  // Custom color
        gradient: 'from-purple-500/10 to-indigo-500/10'
    }
];
```

### Permission-Based Access Control

```jsx
// Template automatically handles permissions
<AdminManagementTemplate
    primaryPermission="leaves.manage"  // Main permission check
    // ... other props
>
    {/* Content only shows if user has permission */}
</AdminManagementTemplate>

// Individual component permissions
const quickActions = [
    {
        label: 'Add New',
        permission: 'leaves.create',  // Only shows if user has this permission
        onPress: handleAdd
    }
];
```

### Loading and Error States

```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Templates handle loading/error states automatically
<AdminManagementTemplate
    loading={loading}
    error={error}
    // ... other props
/>

// Manual error handling in forms
<FormTemplate
    error={submitError}
    success={submitSuccess}
    // ... other props
/>
```

### Responsive Design

```jsx
// Templates are responsive by default
// Customize breakpoints via size props

const widgets = [
    {
        title: 'Widget',
        size: { 
            xs: 12,    // Full width on mobile
            sm: 6,     // Half width on small screens
            md: 4,     // Third width on medium screens
            lg: 3      // Quarter width on large screens
        }
    }
];
```

## Best Practices

### 1. Consistent Data Structure
```jsx
// Always use consistent data structures
const stats = [
    { label: 'Label', value: 100, color: 'primary', icon: Icon, trend: 'up', change: '+5%' }
];

const columns = [
    { key: 'field', label: 'Display Name', sortable: true, render: (value, row) => {} }
];
```

### 2. Permission Naming Convention
```jsx
// Use dot notation for permissions
primaryPermission="module.action"           // e.g., "leaves.view"
permission="module.action.scope"            // e.g., "leaves.create.own"
```

### 3. Error Handling
```jsx
// Always handle loading and error states
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
        // Action logic
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

### 4. Accessibility
```jsx
// Templates include accessibility features by default
// Enhance with additional props when needed
<Button
    aria-label="Delete item"
    title="Delete this item permanently"
>
    <TrashIcon />
</Button>
```

This template system provides a solid foundation for building consistent, professional, and maintainable UIs throughout the Aero-HR application.
