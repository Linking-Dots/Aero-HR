# Aero-HR UI Template System Documentation

## Overview

This template system provides reusable, consistent UI components and templates for the Aero-HR application. It ensures design consistency, reduces code duplication, and provides a standardized approach to building admin and employee interfaces.

## Directory Structure

```
resources/js/Templates/
├── AdminManagement/
│   └── AdminManagementTemplate.jsx    # Main admin interface template
├── EmployeeViews/
│   └── EmployeeViewTemplate.jsx       # Employee-focused interface template
├── SharedComponents/
│   ├── CommonComponents.jsx           # Shared UI components
│   ├── DataTableTemplate.jsx          # Reusable data table
│   └── FilterTemplate.jsx             # Filter and search component
├── Examples/
│   └── ExampleLeaveAdminView.jsx      # Example implementation
└── index.js                           # Export file
```

## Components

### 1. AdminManagementTemplate

A comprehensive template for admin management pages with industry-standard features.

#### Features:
- ✅ **Permission-based access control**
- ✅ **Glass-morphism design with gradient accents**
- ✅ **Quick statistics dashboard**
- ✅ **Tab-based navigation**
- ✅ **Advanced filtering system**
- ✅ **Responsive design (mobile/tablet/desktop)**
- ✅ **Action button integration**
- ✅ **Loading and error states**

#### Usage:
```jsx
import { AdminManagementTemplate } from '@/Templates';

<AdminManagementTemplate
    title="Page Title"
    pageTitle="Leave Management"
    pageDescription="Manage employee leaves"
    pageIcon={CalendarIcon}
    quickStats={statsArray}
    tabs={tabsArray}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    filters={filtersArray}
    actionButtons={actionButtons}
    loading={loading}
    error={error}
    primaryPermission="leaves.view"
>
    {/* Your main content */}
</AdminManagementTemplate>
```

#### Props:
- `title` (string): Page title for Head component
- `pageTitle` (string): Display title
- `pageDescription` (string): Page description
- `pageIcon` (Component): Icon component
- `quickStats` (Array): Statistics cards configuration
- `tabs` (Array): Tab configuration
- `activeTab` (string): Current active tab
- `onTabChange` (Function): Tab change handler
- `filters` (Array): Filter configuration
- `actionButtons` (ReactNode): Header action buttons
- `loading` (boolean): Loading state
- `error` (string): Error message
- `primaryPermission` (string): Required permission

### 2. EmployeeViewTemplate

A template optimized for employee-focused interfaces with personal data views.

#### Features:
- ✅ **Personal data focus**
- ✅ **Summary cards for personal metrics**
- ✅ **Simplified filtering**
- ✅ **Mobile-first responsive design**
- ✅ **Permission-based access**

#### Usage:
```jsx
import { EmployeeViewTemplate } from '@/Templates';

<EmployeeViewTemplate
    title="My Leaves"
    pageTitle="My Leave Requests"
    pageDescription="View and manage your leave requests"
    summaryCards={summaryCards}
    filters={filters}
    primaryPermission="leave.own.view"
>
    {/* Your content */}
</EmployeeViewTemplate>
```

### 3. DataTableTemplate

A responsive data table component with built-in features.

#### Features:
- ✅ **Mobile card view / Desktop table view**
- ✅ **Bulk selection and actions**
- ✅ **Pagination**
- ✅ **Loading and empty states**
- ✅ **Sortable columns**

#### Usage:
```jsx
import { DataTableTemplate } from '@/Templates';

<DataTableTemplate
    data={data}
    columns={columns}
    renderCell={renderCell}
    renderMobileCard={renderMobileCard}
    isSelectable={true}
    selectedKeys={selectedKeys}
    onSelectionChange={setSelectedKeys}
    pagination={pagination}
    onPageChange={handlePageChange}
    bulkActions={bulkActions}
    itemLabel="leave"
/>
```

### 4. FilterTemplate

A comprehensive filtering and search component.

#### Features:
- ✅ **Multiple filter types (search, select, date, month, year)**
- ✅ **Quick filter buttons**
- ✅ **Active filter counter**
- ✅ **Collapsible interface**
- ✅ **Reset functionality**

#### Usage:
```jsx
import { FilterTemplate } from '@/Templates';

<FilterTemplate
    filters={filterConfig}
    values={filterValues}
    onChange={handleFilterChange}
    onReset={handleResetFilters}
    quickFilters={quickFilters}
    title="Search & Filter"
/>
```

### 5. Shared Components

#### BulkActionBar
Displays selected items count and bulk action buttons.

#### StatusChip
Reusable status indicator with icons and colors.

#### QuickStatsGrid
Grid layout for displaying quick statistics.

#### EmptyState, LoadingState, ErrorState
Consistent state components for different scenarios.

## Design System

### Color Scheme
- **Primary**: Blue gradient (`from-blue-400 to-purple-400`)
- **Success**: Green (`text-green-600`, `bg-green-500/20`)
- **Warning**: Orange/Amber (`text-orange-600`, `bg-orange-500/20`)
- **Danger**: Red (`text-red-600`, `bg-red-500/20`)
- **Background**: Glass-morphism (`bg-white/10 backdrop-blur-md`)

### Typography
- **Headings**: Bold, gradient text for main titles
- **Body**: Standard foreground colors
- **Secondary**: `text-default-500` for descriptions
- **Captions**: `text-default-400` for minor text

### Spacing & Layout
- **Padding**: `p-6` for main content areas, `p-4` for cards
- **Margins**: `mb-6` for major sections, `mb-4` for subsections
- **Grid**: Responsive grid with `xs={12} sm={6} md={3}` pattern
- **Gaps**: `gap-4` for cards, `gap-2` for buttons

### Responsive Breakpoints
- **Mobile**: `< 640px` - Card layouts, compact components
- **Tablet**: `640px - 1024px` - Hybrid layouts
- **Desktop**: `> 1024px` - Full table layouts, expanded components

## Usage Guidelines

### 1. **Permission Integration**
Always include permission checks in templates:
```jsx
primaryPermission="module.action"
```

### 2. **State Management**
Use consistent state patterns:
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState([]);
```

### 3. **Filter Configuration**
Define filters as configuration objects:
```jsx
const filterConfig = [
    {
        key: 'search',
        type: 'search',
        label: 'Search',
        placeholder: 'Enter search term...',
        gridSize: { md: 3 }
    }
];
```

### 4. **Statistics Configuration**
Configure stats with consistent structure:
```jsx
const quickStats = [
    {
        label: 'Active',
        value: 25,
        icon: CheckCircleIcon,
        gradient: 'from-green-500/10 to-emerald-500/10',
        borderColor: 'border-green-500/20',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-600',
        textColor: 'text-green-600'
    }
];
```

### 5. **Responsive Considerations**
- Always provide mobile card alternatives for tables
- Use responsive grid sizing
- Consider mobile-specific components for actions

## Best Practices

### 1. **Consistency**
- Use the same design patterns across all pages
- Follow the established color scheme
- Use consistent spacing and typography

### 2. **Performance**
- Implement proper memoization for expensive operations
- Use React.useCallback for event handlers
- Minimize re-renders with proper dependency arrays

### 3. **Accessibility**
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Provide screen reader friendly content

### 4. **Error Handling**
- Always handle loading states
- Provide meaningful error messages
- Include retry mechanisms where appropriate

### 5. **Mobile Experience**
- Design mobile-first
- Provide touch-friendly interfaces
- Optimize for smaller screens

## Migration Guide

### From Existing Components

1. **Identify the template type needed**:
   - Admin management → `AdminManagementTemplate`
   - Employee personal views → `EmployeeViewTemplate`

2. **Extract configuration**:
   - Move hardcoded values to configuration objects
   - Separate data logic from presentation

3. **Update imports**:
   ```jsx
   import { AdminManagementTemplate } from '@/Templates';
   ```

4. **Refactor component structure**:
   - Move content into template children
   - Configure props instead of hardcoding

5. **Test thoroughly**:
   - Verify mobile responsiveness
   - Check permission integration
   - Validate all interactive features

## Examples

See `Templates/Examples/` for complete implementation examples showing how to use each template effectively.

## Future Enhancements

### Planned Features
- **Form Templates**: Standardized form layouts
- **Modal Templates**: Consistent modal designs
- **Chart Templates**: Data visualization components
- **Report Templates**: Standardized report layouts
- **Dashboard Widgets**: Reusable dashboard components

### Customization Options
- **Theme Variants**: Dark/light mode support
- **Color Schemes**: Customizable color palettes
- **Layout Options**: Different layout configurations
- **Animation Presets**: Consistent animation patterns

## Support

For questions or issues with the template system:
1. Check the examples in `Templates/Examples/`
2. Review existing implementations in the codebase
3. Refer to this documentation
4. Create detailed issue reports with reproduction steps
