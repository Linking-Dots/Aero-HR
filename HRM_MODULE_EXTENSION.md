# HRM Module Extension

This document describes the ISO-compliant extensions to the Human Resource Management (HRM) module implemented in this application.

## Features Added

The HRM module has been extended with the following ISO-compliant features:

1. **Employee Onboarding & Offboarding**
   - Structured onboarding processes with task tracking
   - Comprehensive offboarding procedures
   - Checklist templates for consistent processes

2. **Skills & Competency Management**
   - Skill tracking and assessment
   - Competency frameworks
   - Employee skill mapping

3. **Employee Benefits Administration**
   - Benefits package management
   - Employee benefit assignments
   - Benefits tracking and reporting

4. **Enhanced Time-off Management**
   - Leave request and approval workflows
   - Time-off calendars
   - Leave balance reporting

5. **Workplace Health & Safety**
   - Safety incident reporting and tracking
   - Safety inspections
   - Safety training management

6. **HR Analytics & Reporting**
   - Attendance analytics
   - Performance metrics
   - Recruitment analytics
   - Turnover analysis
   - Training effectiveness metrics

7. **HR Document Management**
   - Document categorization
   - Employee document management
   - Document version control

8. **Enhanced Employee Self-Service Portal**
   - Profile management
   - Document access
   - Benefits overview
   - Time-off requests
   - Training access
   - Payslip access
   - Performance reviews

## Architecture

The extension follows a layered architecture:

- **Models**: Represent the data structures for each feature
- **Migrations**: Define the database schema changes
- **Controllers**: Handle the business logic and request processing
- **Policies**: Implement authorization rules for each model
- **Routes**: Define the API endpoints for each feature
- **Frontend Components**: Provide the user interface for each feature

## Authorization

The system uses a comprehensive role-based access control system:

- **Roles**: Super Admin, HR Manager, Department Manager, Employee
- **Permissions**: Granular permissions for each feature and operation
- **Policies**: Model-specific authorization rules

## Setup Instructions

To set up the HRM module extensions:

1. Run the extension command:

```bash
php artisan hrm:extend
```

This command will:
- Run all required migrations
- Seed default data for document categories, skills, competencies, benefits, and safety training
- Set up permissions and roles

## Troubleshooting

If you encounter issues with the HRM module:

1. Check migration status:
```bash
php artisan migrate:status
```

2. Fix migration records if needed:
```bash
php artisan hrm:extend --fix-migration-records
```

3. Run all pending migrations:
```bash
php artisan hrm:extend --run-all-pending
```

4. For a clean start (use with caution, will drop all tables):
```bash
php artisan hrm:extend --force-fresh
```

## Additional Documentation

For more detailed information on specific features, refer to:
- [Onboarding & Offboarding Processes](docs/onboarding-offboarding.md)
- [Skills & Competency Framework](docs/skills-competency.md)
- [Benefits Administration](docs/benefits.md)
- [Workplace Safety Management](docs/workplace-safety.md)
- [HR Document Management](docs/document-management.md)

## Standards Compliance

This HRM module has been designed to align with the following standards:
- ISO 30400 series (Human Resource Management)
- ISO 9001:2015 (Quality Management Systems)
- ISO 45001:2018 (Occupational Health and Safety)
