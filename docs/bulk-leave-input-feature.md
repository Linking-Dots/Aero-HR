# Bulk Leave Input Feature

## Overview

The Bulk Leave Input feature allows users to create multiple leave requests in a single operation by selecting multiple dates from a calendar interface. This feature enhances productivity by reducing the time needed to submit multiple individual leave requests.

## Features

- **Multi-Date Calendar Selection**: Interactive calendar with multi-date selection capability
- **Real-time Validation**: Server-side validation with per-date results and conflict detection
- **Balance Impact Preview**: Shows estimated leave balance impact before submission
- **Partial Success Mode**: Option to create valid leaves even if some dates fail validation
- **Admin Support**: Administrators can create bulk leaves for any employee
- **Permission-Based Access**: Respects existing RBAC system using `leaves.create` permission
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## User Interface

### Calendar Component
- Click to select/deselect individual dates
- Visual indicators for:
  - Selected dates (blue highlight)
  - Existing leaves (red indicator)
  - Public holidays (yellow indicator)
  - Today (blue border)
  - Weekends (muted text)
- Selection summary showing count and selected dates

### Form Controls
- **Employee Selection**: Available for admin users to select target employee
- **Leave Type Selection**: Dropdown showing available leave types with balance information
- **Reason**: Required textarea for leave justification (5-500 characters)
- **Partial Success**: Optional toggle to allow partial processing

### Validation Preview
- Summary statistics (valid/warnings/conflicts)
- Leave balance impact calculation
- Per-date validation results with specific error messages
- Real-time validation feedback

## API Endpoints

### Validation Endpoint
```http
POST /leaves/bulk/validate
```

**Request:**
```json
{
  "user_id": 123,
  "dates": ["2025-09-01", "2025-09-03", "2025-09-04"],
  "leave_type_id": 2,
  "reason": "Project shutdown and maintenance"
}
```

**Response:**
```json
{
  "success": true,
  "validation_results": [
    {
      "date": "2025-09-01",
      "status": "valid",
      "errors": [],
      "warnings": []
    },
    {
      "date": "2025-09-03",
      "status": "conflict",
      "errors": ["User already has approved leave on this date"],
      "warnings": []
    }
  ],
  "estimated_balance_impact": {
    "leave_type": "Sick Leave",
    "current_balance": 10.0,
    "requested_days": 3.0,
    "remaining_balance": 7.0
  }
}
```

### Creation Endpoint
```http
POST /leaves/bulk
```

**Request:**
```json
{
  "user_id": 123,
  "dates": ["2025-09-01", "2025-09-04"],
  "leave_type_id": 2,
  "reason": "Project shutdown and maintenance",
  "allow_partial_success": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk leave request processed successfully",
  "created_leaves": [...],
  "failed_dates": [...],
  "summary": {
    "total_requested": 2,
    "successful": 1,
    "failed": 1
  }
}
```

## Usage Instructions

### For Employees

1. **Access the Feature**:
   - Navigate to the Leave Management page
   - Click the "Add Bulk" button (visible only with `leaves.create` permission)

2. **Select Dates**:
   - Use the calendar to click and select multiple dates
   - Review visual indicators for conflicts or holidays
   - Selected dates are highlighted in blue

3. **Configure Request**:
   - Select the appropriate leave type from the dropdown
   - Enter a detailed reason (minimum 5 characters)
   - Optionally enable "Allow partial success" if you want valid dates processed even if some fail

4. **Validate and Submit**:
   - Click "Validate Dates" to check for conflicts and balance impact
   - Review the validation results and balance impact
   - Click "Create X Leave Requests" to submit

### For Administrators

1. **Additional Controls**:
   - Select the target employee from the dropdown
   - All other steps remain the same as for employees

2. **Advanced Options**:
   - Can override conflicts with proper privileges (future enhancement)
   - Access to all employees in the organization

## Technical Implementation

### Backend Components

- **BulkLeaveService**: Core business logic for validation and processing
- **BulkLeaveController**: HTTP request handling and response formatting
- **BulkLeaveRequest**: Form request validation with custom rules
- **Database Integration**: Uses existing `leaves` table with transaction safety

### Frontend Components

- **BulkLeaveModal**: Main modal component with form controls
- **BulkCalendar**: Interactive multi-date calendar widget
- **BulkValidationPreview**: Validation results and balance impact display

### Integration Points

- **Existing Leave System**: Reuses all existing validation logic and business rules
- **Permission System**: Integrates with existing RBAC using `leaves.create` permission
- **UI Components**: Uses existing modal, button, and form components
- **Data Flow**: Updates existing leave lists and statistics after successful creation

## Validation Rules

### Client-Side Validation
- At least one date must be selected
- Leave type must be selected
- Reason must be 5-500 characters
- No past dates allowed (configurable)

### Server-Side Validation
- User existence and permission verification
- Date format and range validation (max 50 dates)
- Leave type existence verification
- Overlap detection with existing leaves
- Balance limit checking
- Public holiday and weekend warnings

### Per-Date Validation
Each selected date is individually validated for:
- Date format and timezone handling
- Past date restrictions
- Overlap with existing approved/pending leaves
- Balance availability for the leave type
- Policy compliance (weekends, holidays, consecutive limits)

## Error Handling

### Validation Errors
- Clear, actionable error messages for each date
- Color-coded status indicators (green/yellow/red)
- Detailed conflict descriptions
- Balance shortage warnings

### Submission Errors
- Transaction rollback on critical failures
- Partial success reporting with detailed breakdown
- Network error handling with retry suggestions
- Permission denial with clear messaging

## Performance Considerations

### Optimization Features
- Client-side date validation to reduce server requests
- Debounced validation calls during date selection
- Efficient calendar rendering with virtualization
- Minimal re-renders through React memoization

### Scalability
- Maximum 50 dates per request to prevent timeouts
- Database transaction optimization with row-level locking
- Efficient query patterns using existing indexes
- Optional queue integration for very large requests (future enhancement)

## Security Features

- **Permission-Based Access**: Only users with `leaves.create` permission can access
- **Input Validation**: Comprehensive server-side validation of all inputs
- **SQL Injection Prevention**: Uses Eloquent ORM and parameterized queries
- **Transaction Safety**: Atomic operations with automatic rollback
- **Audit Logging**: All bulk operations are logged with user, timestamp, and results

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS Safari 13+, Chrome Mobile 80+
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Responsive Design**: Optimized for desktop, tablet, and mobile

## Troubleshooting

### Common Issues

1. **"Add Bulk" button not visible**:
   - Verify user has `leaves.create` permission
   - Check if leave types are properly configured

2. **Validation fails for all dates**:
   - Ensure dates are not in the past
   - Check leave balance availability
   - Verify leave type is active

3. **Calendar not loading**:
   - Check browser console for JavaScript errors
   - Verify stable internet connection
   - Clear browser cache and reload

4. **Submission fails**:
   - Review validation results before submitting
   - Ensure all required fields are filled
   - Check server logs for detailed error information

### Support

For technical issues or feature requests, please contact the development team or create an issue in the project repository.

## Future Enhancements

- **Recurring Patterns**: Support for weekly/monthly recurring leave patterns
- **Template Saves**: Save common date selections as templates
- **Enhanced Conflict Resolution**: Admin override capabilities for policy exceptions
- **Import/Export**: CSV import for bulk date selections
- **Mobile App Integration**: Native mobile app support
- **Advanced Notifications**: Email/SMS notifications for bulk submissions
