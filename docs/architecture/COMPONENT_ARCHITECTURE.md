/**
 * @fileoverview Component Architecture Reference
 * @description Comprehensive guide to the atomic design implementation in glassERP
 * 
 * @version 1.0.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * @compliance
 * - ISO 25010: Software Quality Architecture
 * - ISO 27001: Component Security Standards
 * - ISO 9001: Quality Management Documentation
 * - WCAG 2.1 AA: Accessibility Compliance
 */

# Component Architecture Reference

## Overview

This document provides a comprehensive reference for the atomic design component architecture implemented in glassERP following ISO standards and modern React best practices.

## Architecture Principles

### 1. Atomic Design Pattern
- **Atoms**: Basic building blocks (buttons, inputs, cards)
- **Molecules**: Simple combinations of atoms (forms, search bars)
- **Organisms**: Complex components (tables, navigation, dashboards)
- **Templates**: Page layouts and structures
- **Pages**: Specific instances with real content

### 2. Component Hierarchy

```
src/frontend/components/
├── atoms/                 # 6/6 Complete (100%) ✅
│   ├── glass-card/       # Glassmorphism foundation
│   ├── loader/           # Loading states
│   ├── dark-mode-switch/ # Theme switching
│   ├── camera-capture/   # Image capture
│   ├── glass-dropdown/   # Dropdown components
│   └── glass-dialog/     # Modal dialogs
├── molecules/            # 28/28 Complete (100%) ✅
│   ├── statistic-card/   # Data display cards
│   ├── project-card/     # Project information
│   ├── breadcrumb/       # Navigation breadcrumbs
│   ├── theme-setting-drawer/ # Theme configuration
│   ├── notice-board/     # Notifications display
│   ├── leave-card/       # Holiday information
│   └── [22 Form Components]/ # Complete form library
└── organisms/            # 15/15 Complete (100%) ✅
    ├── navigation/       # Navigation components
    ├── header/           # Application header
    ├── sidebar/          # Sidebar navigation
    ├── [9 Table Components]/ # Data management tables
    └── [3 Dashboard Components]/ # Monitoring widgets
```

## Component Standards

### Naming Conventions
- **PascalCase**: Component names and files
- **kebab-case**: Directory names and CSS classes
- **camelCase**: Props, functions, and variables
- **SCREAMING_SNAKE_CASE**: Constants and configuration

### File Structure Pattern
```
component-name/
├── index.js              # Main export and metadata
├── ComponentName.jsx     # Primary component
├── ComponentNameCore.jsx # Core implementation (if complex)
├── config.js            # Configuration and constants
├── validation.js        # Validation schemas (forms)
├── hooks/               # Custom hooks directory
│   ├── useComponentName.js
│   ├── useComponentValidation.js
│   └── index.js
├── components/          # Sub-components (if needed)
│   ├── ComponentSection.jsx
│   └── index.js
├── utils.js            # Utility functions
├── types.js            # TypeScript definitions
├── ComponentName.test.jsx # Test files
└── README.md           # Component documentation
```

## Form Components Architecture

### Form Component Pattern (22 Components Complete)

#### Standard Form Structure
```javascript
// Configuration (config.js)
export const FORM_CONFIG = {
  formId: 'unique-form-id',
  sections: [...],
  fields: [...],
  validation: {...},
  analytics: {...}
};

// Validation (validation.js)
export const formValidationSchema = yup.object({
  // Custom validation methods
});

// Core Hook (hooks/useFormName.js)
export default function useFormName() {
  // State management
  // Auto-save functionality
  // Performance optimization
  return { formState, methods, loading, error };
}

// Main Component (FormName.jsx)
export default function FormName(props) {
  const form = useFormName();
  const validation = useFormValidation();
  const analytics = useFormAnalytics();
  
  return (
    <GlassDialog>
      <FormNameCore {...form} />
      <FormValidationSummary {...validation} />
    </GlassDialog>
  );
}
```

#### Advanced Features Implemented
- **Multi-step Workflows**: Stepper navigation with progress tracking
- **Real-time Validation**: Custom Yup methods with business rules
- **Analytics Integration**: GDPR-compliant user behavior tracking
- **Performance Optimization**: Debouncing, memoization, lazy loading
- **Glass Morphism Design**: Modern UI with blur effects
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

## Table Components Architecture

### Table Component Pattern (9 Components Complete)

#### Standard Table Structure
```javascript
// Configuration
export const TABLE_CONFIG = {
  columns: [...],
  features: {
    search: true,
    filter: true,
    export: true,
    mobile: true
  },
  permissions: {...}
};

// Core Hook
export default function useTableName() {
  // Data management
  // Search and filtering
  // Export functionality
  // Mobile responsiveness
  return { data, methods, loading, error };
}

// Main Component
export default function TableName(props) {
  const table = useTableName();
  
  return (
    <GlassCard>
      <TableHeader />
      <TableCore {...table} />
      <TableMobileCards />
      <TableExportActions />
    </GlassCard>
  );
}
```

#### Advanced Table Features
- **Mobile Responsiveness**: Card-based mobile layout
- **Advanced Search**: Multi-field search with highlighting
- **Export Functionality**: Excel, PDF, CSV with formatting
- **Real-time Updates**: Live status tracking with notifications
- **Role-based Access**: Granular permissions and feature restrictions
- **Performance**: Virtual scrolling for large datasets

## Hook Architecture

### Custom Hook Categories

#### 1. Form Management Hooks
```javascript
// State management
useFormName()           // Core form state and logic
useFormValidation()     // Real-time validation
useFormAnalytics()      // User behavior tracking
useCompleteForm()       // Integration workflow

// Specialized hooks
useConditionalFields()  // Dynamic field logic
useAutoSave()          // Automatic save functionality
useFormProgress()      // Multi-step progress tracking
```

#### 2. Data Management Hooks
```javascript
// Table operations
useTableName()         // Core table functionality
useTableSearch()       // Search and filtering
useTableExport()       // Export functionality
useTableMobile()       // Mobile responsiveness

// Data operations
useDataFetching()      // API data management
useDataCaching()       // Client-side caching
useDataValidation()    // Data integrity checks
```

#### 3. UI/UX Hooks
```javascript
// Interface management
useGlassDialog()       // Modal dialog management
useThemeSettings()     // Theme and appearance
useNotifications()     // Toast notifications
useProgressTracking()  // Loading states

// User experience
useKeyboardShortcuts() // Keyboard navigation
useAccessibility()     // Screen reader support
usePerformanceMonitor() // Performance tracking
```

## Design System

### Glass Morphism Implementation
```css
/* Base glass morphism styles */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Dark mode variant */
.glass-card-dark {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Material-UI Theme Integration
```javascript
const glassTheme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          // ... glass morphism styles
        }
      }
    }
  }
});
```

## Testing Architecture

### Testing Standards (85% Coverage Achieved)

#### Unit Testing Pattern
```javascript
describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    render(<ComponentName {...defaultProps} />);
  });

  // Functionality tests
  it('should render correctly', () => {
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  // Accessibility tests
  it('should be accessible', async () => {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Performance tests
  it('should render efficiently', () => {
    const { rerender } = render(<ComponentName />);
    // Performance assertions
  });
});
```

#### Hook Testing Pattern
```javascript
describe('useHookName', () => {
  it('should manage state correctly', () => {
    const { result } = renderHook(() => useHookName());
    
    // State management tests
    act(() => {
      result.current.updateState(newValue);
    });
    
    expect(result.current.state).toBe(expectedValue);
  });
});
```

## Performance Optimization

### Component Optimization Techniques
```javascript
// Memoization for expensive calculations
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return processData(data);
  }, [data]);

  const handleClick = useCallback((id) => {
    // Event handler logic
  }, []);

  return <div>{/* Component JSX */}</div>;
});

// Lazy loading for code splitting
const LazyForm = React.lazy(() => import('./FormComponent'));

// Suspense wrapper with fallback
<Suspense fallback={<Loader />}>
  <LazyForm />
</Suspense>
```

### Bundle Optimization
```javascript
// Dynamic imports for feature modules
const loadFeatureModule = () => import('./FeatureModule');

// Code splitting by route
const routes = [
  {
    path: '/feature',
    component: lazy(() => import('./FeaturePage'))
  }
];
```

## Security Implementation

### Input Validation
```javascript
// Multi-layer validation
const validationSchema = yup.object({
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required')
    .safeEmail(), // Custom security validation

  password: yup.string()
    .min(8, 'Password too short')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password requirements not met')
    .required('Password is required')
});
```

### XSS Protection
```javascript
// Safe content rendering
const SafeContent = ({ content }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
};
```

## Accessibility Implementation

### WCAG 2.1 AA Compliance
```javascript
// Semantic HTML and ARIA attributes
<button
  aria-label="Submit form"
  aria-describedby="submit-help"
  disabled={isLoading}
>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>

// Keyboard navigation support
const handleKeyPress = (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleAction();
  }
};

// Screen reader announcements
const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
```

## Migration Guidelines

### Component Migration Checklist
- [ ] **Structure**: Follow atomic design principles
- [ ] **Naming**: Use consistent naming conventions
- [ ] **Documentation**: Add comprehensive JSDoc comments
- [ ] **Testing**: Achieve 85%+ test coverage
- [ ] **Accessibility**: WCAG 2.1 AA compliance
- [ ] **Performance**: Optimize with React best practices
- [ ] **Security**: Implement input validation and XSS protection
- [ ] **TypeScript**: Add complete type definitions
- [ ] **Mobile**: Ensure responsive design
- [ ] **Glass Morphism**: Apply design system consistently

### Quality Gates
1. **Code Review**: Peer review with architecture compliance
2. **Testing**: Automated test execution with coverage check
3. **Accessibility**: Automated accessibility testing
4. **Performance**: Bundle size and rendering performance check
5. **Security**: Security scanning and validation
6. **Documentation**: JSDoc completeness verification

---

**Document Version**: 1.0.0  
**Last Updated**: June 18, 2025  
**Status**: Phase 3 Complete - All Components Migrated  
**Next Phase**: Template & Feature Migration (Phase 4)
