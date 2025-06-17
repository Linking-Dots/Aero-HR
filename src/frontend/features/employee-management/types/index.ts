/**
 * Employee Management Feature Types
 * ISO 25010 Quality Characteristic: Maintainability - Modularity
 */

// Employee Data Types
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  department_id?: number;
  designation_id?: number;
  attendance_type_id?: number;
  employee_id?: string;
  hire_date?: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  created_at: string;
  updated_at: string;
  
  // Relationships
  department?: Department;
  designation?: Designation;
  attendance_type?: AttendanceType;
  roles?: Role[];
}

// Department Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  manager?: Employee;
  employees?: Employee[];
}

// Designation Types
export interface Designation {
  id: number;
  title: string;
  description?: string;
  department_id?: number;
  level?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  department?: Department;
  employees?: Employee[];
}

// Attendance Type
export interface AttendanceType {
  id: number;
  name: string;
  description?: string;
  work_hours_per_day: number;
  flexible_timing: boolean;
  grace_period_minutes?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  employees?: Employee[];
}

// Role Types
export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

// Table Configuration Types
export interface EmployeeTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'select' | 'date' | 'status' | 'avatar';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface EmployeeTableFilter {
  department?: number[];
  designation?: number[];
  attendance_type?: number[];
  status?: string[];
  search?: string;
}

export interface EmployeeTableSort {
  field: string;
  direction: 'asc' | 'desc';
}

// Form Types
export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department_id?: number;
  designation_id?: number;
  attendance_type_id?: number;
  employee_id?: string;
  hire_date?: string;
  profile_image?: File;
  roles?: number[];
}

export interface EmployeeValidationErrors {
  first_name?: string[];
  last_name?: string[];
  email?: string[];
  phone?: string[];
  department_id?: string[];
  designation_id?: string[];
  attendance_type_id?: string[];
  employee_id?: string[];
  hire_date?: string[];
  profile_image?: string[];
  roles?: string[];
}

// API Response Types
export interface EmployeeListResponse {
  data: Employee[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface EmployeeApiResponse {
  employee: Employee;
  message?: string;
  status: 'success' | 'error';
}

export interface DepartmentListResponse {
  data: Department[];
}

export interface DesignationListResponse {
  data: Designation[];
}

export interface AttendanceTypeListResponse {
  data: AttendanceType[];
}

// Component Props Types
export interface EmployeeTableProps {
  employees: Employee[];
  departments: Department[];
  designations: Designation[];
  attendanceTypes: AttendanceType[];
  onEmployeeUpdate?: (employee: Employee) => void;
  onEmployeeDelete?: (employeeId: number) => void;
  loading?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
}

export interface EmployeeFormProps {
  employee?: Employee;
  departments: Department[];
  designations: Designation[];
  attendanceTypes: AttendanceType[];
  roles: Role[];
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  errors?: EmployeeValidationErrors;
}

export interface EmployeeCardProps {
  employee: Employee;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewProfile?: () => void;
  showActions?: boolean;
}

// Hook Types
export interface UseEmployeeTableReturn {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  filters: EmployeeTableFilter;
  sort: EmployeeTableSort;
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  updateEmployee: (id: number, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  setFilters: (filters: Partial<EmployeeTableFilter>) => void;
  setSort: (sort: EmployeeTableSort) => void;
  setPage: (page: number) => void;
  refreshData: () => Promise<void>;
}

export interface UseEmployeeFormReturn {
  formData: EmployeeFormData;
  errors: EmployeeValidationErrors;
  loading: boolean;
  handleInputChange: (field: keyof EmployeeFormData, value: any) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  validateField: (field: keyof EmployeeFormData) => boolean;
  isValid: boolean;
}

// Utility Types
export interface EmployeeSearchParams {
  query?: string;
  department?: number;
  designation?: number;
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface EmployeeExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  fields: string[];
  filters?: EmployeeTableFilter;
  includeImages?: boolean;
}

// Constants
export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'warning' },
  { value: 'suspended', label: 'Suspended', color: 'danger' },
  { value: 'terminated', label: 'Terminated', color: 'default' },
] as const;

export const EMPLOYEE_TABLE_COLUMNS: EmployeeTableColumn[] = [
  { key: 'profile', label: 'Employee', type: 'avatar', width: '250px' },
  { key: 'employee_id', label: 'ID', sortable: true, width: '100px' },
  { key: 'department', label: 'Department', type: 'select', sortable: true, filterable: true },
  { key: 'designation', label: 'Designation', type: 'select', sortable: true, filterable: true },
  { key: 'attendance_type', label: 'Attendance Type', type: 'select', filterable: true },
  { key: 'hire_date', label: 'Hire Date', type: 'date', sortable: true },
  { key: 'status', label: 'Status', type: 'status', filterable: true },
  { key: 'actions', label: 'Actions', width: '100px', align: 'center' },
] as const;
