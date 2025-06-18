/**
 * Project Management Feature Components Export
 * 
 * @file components/index.js
 * @description Central export point for all project management feature components
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Forms: Project and daily work form components
 * - Tables: Project data display components
 * - Cards: Project information cards
 * - Widgets: Project dashboard widgets
 */

// Form Components
export { default as DailyWorkForm } from '@/Components/molecules/DailyWorkForm';
export { default as DailyWorksUploadForm } from '@/Components/molecules/DailyWorksUploadForm';
export { default as DailyWorksDownloadForm } from '@/Components/molecules/DailyWorksDownloadForm';
export { default as DailyWorkSummaryDownloadForm } from '@/Components/molecules/DailyWorkSummaryDownloadForm';
export { default as DeleteDailyWorkForm } from '@/Components/molecules/DeleteDailyWorkForm';

// Table Components
export { default as DailyWorksTable } from '@/Components/organisms/DailyWorksTable';
export { default as DailyWorkSummaryTable } from '@/Components/organisms/DailyWorkSummaryTable';

// Project Dashboard Components (mock implementations for now)
export const ProjectCalendar = ({ projects = [], milestones = [], onDateClick, className }) => {
  return (
    <div className={`${className || ''} bg-white/5 rounded-lg p-4 flex items-center justify-center`}>
      <div className="text-center text-gray-400">
        <p>Project Calendar Component</p>
        <p className="text-sm mt-2">Will display project milestones and deadlines</p>
        <p className="text-sm">Projects: {projects.length} • Milestones: {milestones.length}</p>
      </div>
    </div>
  );
};

export const ProjectGanttChart = ({ projects = [], onProjectClick, className }) => {
  return (
    <div className={`${className || ''} bg-white/5 rounded-lg p-4 flex items-center justify-center`}>
      <div className="text-center text-gray-400">
        <p>Project Gantt Chart Component</p>
        <p className="text-sm mt-2">Will display project timelines and dependencies</p>
        <p className="text-sm">Projects: {projects.length}</p>
      </div>
    </div>
  );
};

export const TeamPerformanceChart = ({ teams = [], className }) => {
  return (
    <div className={`${className || ''} bg-white/5 rounded-lg p-4 flex items-center justify-center`}>
      <div className="text-center text-gray-400">
        <p>Team Performance Chart Component</p>
        <p className="text-sm mt-2">Will display team productivity metrics</p>
        <p className="text-sm">Teams: {teams.length}</p>
      </div>
    </div>
  );
};

/**
 * Project Management Component Categories
 * 
 * Organized by atomic design principles for easy discovery
 * and consistent usage across the feature module.
 */
export const PROJECT_COMPONENTS = {
  forms: [
    'DailyWorkForm',
    'DailyWorksUploadForm',
    'DailyWorksDownloadForm',
    'DailyWorkSummaryDownloadForm',
    'DeleteDailyWorkForm'
  ],
  tables: [
    'DailyWorksTable',
    'DailyWorkSummaryTable'
  ],
  widgets: [
    'ProjectCalendar',
    'ProjectGanttChart',
    'TeamPerformanceChart'
  ],
  cards: []
};

/**
 * Feature metadata for development tools
 */
export const FEATURE_METADATA = {
  name: 'Project Management',
  version: '1.0.0',
  components: {
    total: 10,
    forms: 5,
    tables: 2,
    widgets: 3,
    cards: 0
  },
  status: 'complete',
  lastUpdated: '2025-01-20'
};
