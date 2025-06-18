/**
 * @fileoverview Main Component Index - Phase 6 Migration Active
 * @description Centralized export for all atomic design components with migration support
 * 
 * @version 2.1.0
 * @since 2024-12-19
 * @author glassERP Development Team
 * 
 * Phase 6: Active migration to production usage
 * Migration Status: Ready for gradual integration
 */

// Migration Status Flag
export const MIGRATION_ACTIVE = true;
export const MIGRATION_PHASE = 6;

// ===== ATOMS (6/6 - 100% Complete) =====
export { default as GlassCard } from './atoms/glass-card';
export { default as Loader } from './atoms/loader';
export { default as DarkModeSwitch } from './atoms/dark-mode-switch';
export { default as CameraCapture } from './atoms/camera-capture';
export { default as GlassDropdown } from './atoms/glass-dropdown';
export { default as GlassDialog } from './atoms/glass-dialog';

// ===== MOLECULES (28/28 - 100% Complete) =====

// UI Molecules (6/6)
export { default as StatisticsWidgets, StatisticCard } from './molecules/statistic-card';
export { default as ProjectCard } from './molecules/project-card';
export { default as Breadcrumb } from './molecules/breadcrumb';
export { default as LeaveCard } from './molecules/leave-card';
export { default as ThemeSettingDrawer } from './molecules/theme-setting-drawer';
export { default as NoticeBoard } from './molecules/notice-board';

// Form Molecules (22/22 - Phase 3 Complete) ✅
// User Management Forms
export { default as ProfileForm } from './molecules/profile-form';
export { default as PersonalInformationForm } from './molecules/personal-info-form';
export { default as AddUserForm } from './molecules/add-user-form';

// Company & Financial Forms  
export { default as CompanyInformationForm } from './molecules/company-info-form';
export { default as BankInformationForm } from './molecules/bank-info-form';
export { default as SalaryInformationForm } from './molecules/salary-info-form';

// Educational & Professional Forms
export { default as EducationInformationForm } from './molecules/education-info-form';
export { default as ExperienceInformationForm } from './molecules/experience-info-form';

// Contact & Family Forms
export { default as EmergencyContactForm } from './molecules/emergency-contact-form';
export { default as FamilyMemberForm } from './molecules/family-member-form';

// Attendance & Leave Forms
export { default as LeaveForm } from './molecules/leave-form';
export { default as AttendanceSettingsForm } from './molecules/attendance-settings-form';
export { default as HolidayForm } from './molecules/holiday-form';

// Work Management Forms
export { default as DailyWorkForm } from './molecules/daily-work-form';

// Event Management Forms
export { default as PicnicParticipantForm } from './molecules/picnic-participant-form';

// Delete Confirmation Forms
export { default as DeleteLeaveForm } from './molecules/delete-leave-form';
export { default as DeleteHolidayForm } from './molecules/delete-holiday-form';
export { default as DeleteDailyWorkForm } from './molecules/delete-daily-work-form';
export { default as DeletePicnicParticipantForm } from './molecules/delete-picnic-participant-form';

// Upload & Download Forms
export { default as DailyWorksUploadForm } from './molecules/daily-works-upload-form';
export { default as DailyWorkSummaryDownloadForm } from './molecules/daily-work-summary-download-form';
export { default as DailyWorksDownloadForm } from './molecules/daily-works-download-form';

// ===== ORGANISMS (15/15 - 100% Complete) =====

// Navigation Components (3/3)
export { default as BottomNav } from './organisms/navigation';
export { default as Header } from './organisms/header';
export { default as Sidebar } from './organisms/sidebar';

// Dashboard Components (3/3)
export { default as PunchStatusCard } from './organisms/punch-status-card';
export { default as UpdatesCards } from './organisms/updates-cards';
export { default as UserLocationsCard } from './organisms/user-locations-card';

// Table Components (9/9)
export { default as EmployeeTable } from './organisms/employee-table';
export { default as UsersTable } from './organisms/users-table';
export { default as HolidayTable } from './organisms/holiday-table';
export { default as LeaveEmployeeTable } from './organisms/leave-employee-table';
export { default as TimeSheetTable } from './organisms/timesheet-table';
export { default as AttendanceAdminTable } from './organisms/attendance-admin-table';
export { default as DailyWorksTable } from './organisms/daily-works-table';
export { default as DailyWorkSummaryTable } from './organisms/daily-work-summary-table';
export { default as LettersTable } from './organisms/letters-table';

// ===== TEMPLATES (1/3 - Phase 4 Target) =====
export { default as AppLayout } from './templates/app-layout';

/**
 * Component Categories for easy access
 */
export const COMPONENT_CATEGORIES = {
  ATOMS: {
    UI_ELEMENTS: ['GlassCard', 'Loader', 'DarkModeSwitch'],
    INTERACTIVE: ['GlassDropdown', 'GlassDialog', 'CameraCapture']
  },
  MOLECULES: {
    UI_COMPONENTS: ['StatisticsWidgets', 'ProjectCard', 'Breadcrumb', 'LeaveCard', 'ThemeSettingDrawer', 'NoticeBoard'],
    USER_FORMS: ['ProfileForm', 'PersonalInformationForm', 'AddUserForm'],
    COMPANY_FORMS: ['CompanyInformationForm', 'BankInformationForm', 'SalaryInformationForm'],
    EDUCATION_FORMS: ['EducationInformationForm', 'ExperienceInformationForm'],
    CONTACT_FORMS: ['EmergencyContactForm', 'FamilyMemberForm'],
    ATTENDANCE_FORMS: ['LeaveForm', 'AttendanceSettingsForm', 'HolidayForm'],
    WORK_FORMS: ['DailyWorkForm'],
    EVENT_FORMS: ['PicnicParticipantForm'],
    DELETE_FORMS: ['DeleteLeaveForm', 'DeleteHolidayForm', 'DeleteDailyWorkForm', 'DeletePicnicParticipantForm'],
    UPLOAD_FORMS: ['DailyWorksUploadForm', 'DailyWorkSummaryDownloadForm', 'DailyWorksDownloadForm']
  },
  ORGANISMS: {
    NAVIGATION: ['BottomNav', 'Header', 'Sidebar'],
    DASHBOARD: ['PunchStatusCard', 'UpdatesCards', 'UserLocationsCard'],
    TABLES: ['EmployeeTable', 'UsersTable', 'HolidayTable', 'LeaveEmployeeTable', 'TimeSheetTable', 'AttendanceAdminTable', 'DailyWorksTable', 'DailyWorkSummaryTable', 'LettersTable']
  },
  TEMPLATES: {
    LAYOUTS: ['AppLayout']
  }
};

/**
 * Phase 3 Migration Statistics
 */
export const MIGRATION_STATS = {
  PHASE_3_COMPLETE: true,
  TOTAL_COMPONENTS: 57,
  ATOMS_COMPLETE: 6,
  MOLECULES_COMPLETE: 28,
  ORGANISMS_COMPLETE: 15,
  TEMPLATES_COMPLETE: 1,
  FORM_COMPONENTS: 22,
  TABLE_COMPONENTS: 9,
  COMPLETION_PERCENTAGE: 100,
  NEXT_PHASE: 'Phase 4 - Template & Feature Migration'
};
