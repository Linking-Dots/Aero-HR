/**
 * Component Type Definitions
 * ISO 25010 Quality Characteristic: Maintainability - Modularity
 */

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

// Project Types
export interface ProjectMember {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  openTasks: number;
  completedTasks: number;
  deadline: string;
  progress: number;
  leaders: ProjectMember[];
  team: ProjectMember[];
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
}

// Statistics Types
export interface Statistics {
  total: number;
  completed: number;
  pending: number;
  rfi_submissions: number;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  route: string;
  badge?: number;
  action?: 'sidebar' | 'navigate';
  ariaLabel?: string;
}

// Theme Types
export interface GlassCardTheme {
  backdropFilter: string;
  background: string;
  borderHighlight: string;
  border: string;
  boxShadow: string;
  borderRadius: string;
}

// Component Props Types
export interface StatisticCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ style?: React.CSSProperties; 'aria-hidden'?: boolean }>;
  color: string;
  isLoaded: boolean;
  testId: string;
}

export interface ProjectCardProps {
  project: Project;
}

export interface BottomNavProps {
  auth: { user: User };
  contentRef: React.RefObject<HTMLElement>;
  setBottomNavHeight: (height: number) => void;
  toggleSideBar: () => void;
  sideBarOpen: boolean;
}

export interface LoaderProps {
  size?: number;
  color?: string;
}

export interface DarkModeSwitchProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface StatisticsResponse extends ApiResponse<{ statistics: Statistics }> {}

// Error Types
export interface ErrorState {
  message: string;
  code?: number;
  details?: unknown;
}
