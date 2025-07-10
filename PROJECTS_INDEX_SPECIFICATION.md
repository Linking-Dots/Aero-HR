# Projects Index Page - ISO 21500 & PMBOK® Compliant Design

## Overview
This document outlines the redesigned Projects Index page that serves as a centralized project portfolio management hub, fully compliant with ISO 21500, ISO 10006, PMI PMBOK®, PRINCE2, and Agile/Scrum methodologies.

## Wireframe Layout

### Desktop Layout
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PROJECT PORTFOLIO MANAGEMENT                                                     │
│                             ISO 21500 Compliant • Enterprise Project Hub                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🔔 Alerts: 3] [👤 John Doe - PMO Manager] [🌍 Global View] [📊 Portfolio Dashboard] [➕ New Project] [⚙️ Settings] │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                        PORTFOLIO OVERVIEW KPIs                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   Total     │ │   Active    │ │  On Track   │ │  At Risk    │ │ Completed   │ │  Budget     │ │ Resources   │ │
│ │ Projects    │ │ Projects    │ │ Projects    │ │ Projects    │ │This Quarter │ │Utilization  │ │Allocated    │ │
│ │    247      │ │    89       │ │    67       │ │    15       │ │     23      │ │    87%      │ │   156       │ │
│ │ 📈 +12 MTD  │ │ 🔄 Running  │ │ ✅ Healthy  │ │ ⚠️ Monitor  │ │ 🎯 Target   │ │ 💰 Good     │ │ 👥 Teams    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                     ADVANCED FILTERS & SEARCH                                                      │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔍 [Search projects, leads, departments...]              [🎯 Saved Filters ▼] [🔄 Reset] [💾 Save Filter] │ │
│ │                                                                                                               │ │
│ │ Status: [All ▼] │ Priority: [All ▼] │ Phase: [All ▼] │ Department: [All ▼] │ Lead: [All ▼] │ Budget: [All ▼] │ │
│ │ Risk: [All ▼] │ Timeline: [All ▼] │ Progress: [All ▼] │ Type: [All ▼] │ Methodology: [All ▼] │ Health: [All ▼] │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                         PROJECT GRID VIEW                                                          │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [📋 List View] [📊 Grid View] [📈 Analytics View] [🗓️ Timeline View] [🎯 Portfolio Matrix] [📤 Export] [⚙️] │ │
│ │                                                                                                               │ │
│ │ 📄 Showing 1-25 of 247 projects │ Sort: [Last Modified ▼] │ [◀️ Prev] [1][2][3]...[10] [Next ▶️] [25 per page ▼] │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                           PROJECT CARDS                                                      │ │
│ │ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ ┌─────────────────────┐ │ │
│ │ │ 🏢 Digital Transformation Initiative  │ │ 🚀 Customer Portal Enhancement       │ │ 📊 Data Analytics   │ │ │
│ │ │ ID: PRJ-2025-001 │ 🔴 Critical Priority│ │ ID: PRJ-2025-002 │ 🟡 High Priority  │ │ Platform Migration  │ │ │
│ │ │ ─────────────────────────────────────  │ │ ─────────────────────────────────────  │ │ ID: PRJ-2025-003    │ │ │
│ │ │ Status: 🔄 In Progress (Planning)     │ │ Status: ⏸️ On Hold (Execution)       │ │ Status: ✅ Completed│ │ │
│ │ │ Progress: ████████░░ 78%              │ │ Progress: ███████░░░ 65%              │ │ Progress: █████████ │ │ │
│ │ │ Timeline: Jan 15 - Dec 30, 2025       │ │ Timeline: Mar 01 - Oct 15, 2025       │ │ 100%                │ │ │
│ │ │ Budget: $2.4M / $3.2M (75% used)      │ │ Budget: $890K / $1.2M (74% used)      │ │ Timeline: Q1 2025   │ │ │
│ │ │ 📊 SPI: 0.95 │ 💰 CPI: 1.08           │ │ 📊 SPI: 0.88 │ 💰 CPI: 0.94           │ │ Budget: $650K       │ │ │
│ │ │ 👥 Lead: Sarah Johnson (PM)           │ │ 👥 Lead: Mike Chen (SM)               │ │ 📊 SPI: 1.05        │ │ │
│ │ │ 🏢 Dept: IT Transformation            │ │ 🏢 Dept: Customer Experience          │ │ 💰 CPI: 1.12        │ │ │
│ │ │ ⚠️ Risk: High (Resource Conflict)     │ │ ⚠️ Risk: Medium (Vendor Delays)       │ │ 👥 Lead: Alex Wong   │ │ │
│ │ │ 🎯 Health: 🟡 At Risk                │ │ 🎯 Health: 🔴 Critical               │ │ 🏢 Dept: Analytics  │ │ │
│ │ │ 📋 Methodology: Agile/Scrum           │ │ 📋 Methodology: PRINCE2               │ │ ⚠️ Risk: Low        │ │ │
│ │ │ 📅 Next Milestone: Architecture Review│ │ 📅 Next Milestone: User Testing       │ │ 🎯 Health: ✅ Good  │ │ │
│ │ │ ──────────────────────────────────     │ │ ──────────────────────────────────     │ │ 📋 Method: Kanban   │ │ │
│ │ │ [👁️ View] [✏️ Edit] [📋 Tasks]        │ │ [👁️ View] [✏️ Edit] [📋 Tasks]        │ │ [👁️ View] [📊 Report]│ │ │
│ │ │ [📊 Reports] [🔄 Clone] [📁 Archive]  │ │ [📊 Reports] [🔄 Clone] [📁 Archive]  │ │ [📁 Archive]        │ │ │
│ │ └───────────────────────────────────────┘ └───────────────────────────────────────┘ └─────────────────────┘ │ │
│ │                                                                                                               │ │
│ │ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ ┌─────────────────────┐ │ │
│ │ │ 🌐 Global ERP Integration             │ │ 🔒 Security Compliance Audit         │ │ 🎨 Brand Refresh    │ │ │
│ │ │ ID: PRJ-2025-004 │ 🟢 Medium Priority │ │ ID: PRJ-2025-005 │ 🔴 Critical Priority│ │ Campaign            │ │ │
│ │ │ Status: 🔄 In Progress (Execution)    │ │ Status: 📋 Not Started (Initiation)  │ │ ID: PRJ-2025-006    │ │ │
│ │ │ Progress: ████░░░░░░ 42%              │ │ Progress: ░░░░░░░░░░ 0%               │ │ Status: 🔄 Planning │ │ │
│ │ │ [👁️ View] [✏️ Edit] [📋 Tasks]        │ │ [👁️ View] [✏️ Edit] [▶️ Start]       │ │ [👁️ View] [✏️ Edit] │ │ │
│ │ └───────────────────────────────────────┘ └───────────────────────────────────────┘ └─────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                                   │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 📊 Portfolio Analytics: [🎯 Health Score: 82%] [⏱️ Avg Delivery: 94%] [💰 Budget Variance: +3.2%]          │ │
│ │ 🔄 Last Updated: July 10, 2025 14:32 GMT │ 👁️ 1,247 views today │ 📈 Trending: Digital Projects ↗️        │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Alternative List View
```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           LIST VIEW MODE                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [☑️] │ Project Name              │Status    │Progress│Phase      │Lead          │Budget   │Risk │Health│Actions  │
│──────┼───────────────────────────┼──────────┼────────┼───────────┼──────────────┼─────────┼─────┼──────┼─────────│
│ [☑️] │🏢 Digital Transformation  │🔄 Active │████ 78%│Execution  │Sarah Johnson │$2.4M/3.2│High │🟡 Risk│[⋯ Menu]│
│ [☑️] │🚀 Customer Portal        │⏸️ Hold   │███ 65% │Execution  │Mike Chen     │$890K/1.2│Med  │🔴 Crit│[⋯ Menu]│
│ [☑️] │📊 Data Analytics         │✅ Done   │███ 100%│Closure    │Alex Wong     │$650K    │Low  │✅ Good│[⋯ Menu]│
│ [☑️] │🌐 ERP Integration        │🔄 Active │██ 42%  │Execution  │Lisa Zhang    │$1.8M/2.1│Med  │🟡 Risk│[⋯ Menu]│
│ [☑️] │🔒 Security Audit         │📋 Queue  │░ 0%    │Initiation │Tom Wilson    │$450K    │High │⚪ New │[⋯ Menu]│
│──────┴───────────────────────────┴──────────┴────────┴───────────┴──────────────┴─────────┴─────┴──────┴─────────│
│ 📋 Bulk Actions: [📁 Archive Selected] [📤 Export Selected] [🏷️ Tag Selected] [👥 Assign Lead] [📊 Generate Report]│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout
```
┌─────────────────────────────────────────────┐
│    📱 PROJECT PORTFOLIO                     │
├─────────────────────────────────────────────┤
│ [🔔 3] [👤 John D.] [⚙️] [➕]               │
├─────────────────────────────────────────────┤
│               QUICK STATS                   │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │   247   │ │   89    │ │   15    │        │
│ │ Total   │ │ Active  │ │At Risk  │        │
│ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────┤
│ 🔍 [Search projects...]                    │
│ [Filters] [Sort: Recent ▼] [Grid/List]     │
├─────────────────────────────────────────────┤
│              PROJECT CARDS                  │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏢 Digital Transformation              │ │
│ │ PRJ-2025-001 • 🔴 Critical             │ │
│ │ Progress: ████████ 78%                 │ │
│ │ Status: 🔄 In Progress                 │ │
│ │ Lead: Sarah Johnson                    │ │
│ │ Budget: $2.4M/$3.2M                    │ │
│ │ Health: 🟡 At Risk                     │ │
│ │ [View] [Edit] [Tasks]                  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 🚀 Customer Portal Enhancement         │ │
│ │ PRJ-2025-002 • 🟡 High                │ │
│ │ Progress: ███████ 65%                  │ │
│ │ Status: ⏸️ On Hold                     │ │
│ │ [View] [Edit] [Tasks]                  │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [◀️ Prev] Page 1 of 10 [Next ▶️]          │
└─────────────────────────────────────────────┘
```

## Component Specifications

### 1. Portfolio Overview KPIs
**Data Sources**: Project database, budget systems, resource management
**Update Frequency**: Real-time (5-minute intervals)
**Calculations**:
- Total Projects: COUNT(projects.status != 'archived')
- Active Projects: COUNT(projects.status IN ['in_progress', 'planning', 'execution'])
- On Track: COUNT(projects WHERE spi >= 0.95 AND cpi >= 0.95 AND health = 'good')
- At Risk: COUNT(projects WHERE health IN ['at_risk', 'critical'])
- Budget Utilization: SUM(actual_cost) / SUM(budget) * 100
- Resources Allocated: COUNT(DISTINCT assigned_users)

### 2. Advanced Filtering System
**Filter Categories**:

#### Project Status (ISO 21500 Phases)
- Not Started (Initiation pending)
- Planning (Work breakdown, resource planning)
- In Progress (Active execution)
- Monitoring (Performance measurement)
- On Hold (Temporary suspension)
- Completed (Project closure)
- Archived (Historical records)

#### Priority Levels (Risk-based)
- Critical (Business-critical, high impact)
- High (Important, significant impact)
- Medium (Standard business priority)
- Low (Nice-to-have, minimal impact)

#### Project Phases (PMBOK® Process Groups)
- Initiation
- Planning
- Execution
- Monitoring & Controlling
- Closing

#### Risk Assessment
- Low Risk (Green) - Minimal threats identified
- Medium Risk (Yellow) - Manageable risks with mitigation
- High Risk (Orange) - Significant risks requiring attention
- Critical Risk (Red) - Project success threatened

#### Health Indicators
- Good (Green) - On track, metrics positive
- At Risk (Yellow) - Some concerns, monitoring required
- Critical (Red) - Intervention required immediately

#### Project Methodology
- Waterfall (Traditional sequential)
- Agile/Scrum (Iterative development)
- PRINCE2 (Structured project method)
- Kanban (Continuous flow)
- Hybrid (Mixed methodologies)

### 3. Project Card Information
**Primary Fields**:
- Project ID (Unique identifier)
- Project Name (Business title)
- Priority Level (Color-coded chip)
- Status (Current phase indicator)
- Progress Bar (% completion with visual)
- Timeline (Start - End dates)
- Budget Information (Spent/Total with %)

**Performance Metrics** (ISO 21500 KPIs):
- Schedule Performance Index (SPI)
- Cost Performance Index (CPI)
- Quality Score (if applicable)
- Risk Level Assessment

**Team Information**:
- Project Lead (Name and role)
- Department/Division
- Team Size (if applicable)

**Methodology & Process**:
- Project Methodology (Agile, Waterfall, etc.)
- Next Milestone/Deliverable
- Last Update Timestamp

### 4. Quick Actions (Role-Based)

#### Admin/PMO Actions
- **View**: Full project details and analytics
- **Edit**: Modify project settings and assignments
- **Tasks**: Access work breakdown structure
- **Reports**: Generate compliance and performance reports
- **Clone**: Duplicate project structure
- **Archive**: Move to historical records
- **Delete**: Permanent removal (audit logged)

#### Project Manager Actions
- **View**: Project details relevant to role
- **Edit**: Limited to assigned projects
- **Tasks**: Manage work items and assignments
- **Reports**: Generate team performance reports
- **Clone**: Template creation for similar projects

#### Team Member Actions
- **View**: Read-only access to assigned projects
- **Tasks**: View assigned work items
- **Reports**: Personal contribution reports

### 5. Bulk Operations
- Archive Multiple Projects
- Export Selected (Excel, PDF, CSV)
- Assign Tags/Categories
- Change Project Leads
- Generate Portfolio Reports
- Update Priority Levels

### 6. Audit Trail & Compliance
**Logged Actions**:
- Project creation/modification
- Status changes
- Budget adjustments
- Team assignments
- Access attempts
- Export operations

**Compliance Features**:
- ISO 21500 process tracking
- PMBOK® knowledge area coverage
- Regulatory requirement mapping
- Document version control
- Change approval workflows

### 7. Performance Optimization
- Lazy loading for large datasets
- Client-side filtering for responsive UX
- Pagination with configurable page sizes
- Search debouncing (300ms delay)
- Caching of frequently accessed data
- Progressive loading of project details

### 8. Integration Points
- **ERP Systems**: Budget and resource data
- **Time Tracking**: Progress and effort metrics
- **Communication Tools**: Updates and notifications
- **Document Management**: Project artifacts
- **Business Intelligence**: Analytics and reporting

### 9. Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Customizable font sizes
- Alternative text for visual elements

This comprehensive design ensures the Projects Index page serves as a robust, ISO-compliant project portfolio management interface suitable for enterprise environments.
