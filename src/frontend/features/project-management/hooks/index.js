/**
 * Project Management Feature Hooks
 * 
 * @file hooks/index.js
 * @description Custom hooks for project management feature functionality
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Daily work management
 * - Project tracking and filtering
 * - Work statistics and analytics
 * - File upload/download operations
 * - Time tracking and reporting
 */

import { useState, useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import dayjs from 'dayjs';

/**
 * Hook for daily work filtering and search
 * 
 * @param {Array} dailyWorks - Array of daily work data
 * @returns {Object} Search and filter state and handlers
 */
export const useDailyWorkFilter = (dailyWorks = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filtered works based on current filters
  const filteredWorks = useMemo(() => {
    return dailyWorks.filter(work => {
      const matchesSearch = !searchTerm || 
        work.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = !selectedProject || 
        work.project_id === selectedProject;
      
      const matchesEmployee = !selectedEmployee || 
        work.employee_id === selectedEmployee;
      
      const matchesWorkType = !selectedWorkType || 
        work.work_type_id === selectedWorkType;
      
      const matchesDate = !selectedDate || 
        dayjs(work.work_date).isSame(dayjs(selectedDate), 'day');
      
      const matchesDateRange = !dateRange.start || !dateRange.end || 
        (dayjs(work.work_date).isAfter(dayjs(dateRange.start).subtract(1, 'day')) &&
         dayjs(work.work_date).isBefore(dayjs(dateRange.end).add(1, 'day')));
      
      return matchesSearch && matchesProject && matchesEmployee && 
             matchesWorkType && matchesDate && matchesDateRange;
    });
  }, [dailyWorks, searchTerm, selectedProject, selectedEmployee, selectedWorkType, selectedDate, dateRange]);

  // Filter handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleProjectFilter = useCallback((projectId) => {
    setSelectedProject(projectId);
  }, []);

  const handleEmployeeFilter = useCallback((employeeId) => {
    setSelectedEmployee(employeeId);
  }, []);

  const handleWorkTypeFilter = useCallback((workTypeId) => {
    setSelectedWorkType(workTypeId);
  }, []);

  const handleDateFilter = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleDateRangeFilter = useCallback((start, end) => {
    setDateRange({ start, end });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedEmployee('');
    setSelectedWorkType('');
    setSelectedDate('');
    setDateRange({ start: '', end: '' });
  }, []);

  // Filter state
  const hasActiveFilters = Boolean(
    searchTerm || selectedProject || selectedEmployee || selectedWorkType || 
    selectedDate || dateRange.start || dateRange.end
  );

  return {
    // State
    searchTerm,
    selectedProject,
    selectedEmployee,
    selectedWorkType,
    selectedDate,
    dateRange,
    filteredWorks,
    hasActiveFilters,
    
    // Handlers
    handleSearchChange,
    handleProjectFilter,
    handleEmployeeFilter,
    handleWorkTypeFilter,
    handleDateFilter,
    handleDateRangeFilter,
    clearFilters
  };
};

/**
 * Hook for project and work statistics
 * 
 * @param {Array} dailyWorks - Array of daily work data
 * @param {Array} projects - Array of project data
 * @returns {Object} Project statistics and analytics
 */
export const useProjectStats = (dailyWorks = [], projects = []) => {
  return useMemo(() => {
    const totalWorks = dailyWorks.length;
    const totalHours = dailyWorks.reduce((sum, work) => sum + (work.hours || 0), 0);
    const totalProjects = projects.length;
    
    // Active projects (with recent work)
    const recentDate = dayjs().subtract(7, 'days');
    const activeProjects = projects.filter(project => 
      dailyWorks.some(work => 
        work.project_id === project.id && 
        dayjs(work.work_date).isAfter(recentDate)
      )
    ).length;

    // Work distribution by project
    const workByProject = dailyWorks.reduce((acc, work) => {
      const projectId = work.project_id;
      acc[projectId] = (acc[projectId] || 0) + 1;
      return acc;
    }, {});

    // Hours distribution by project
    const hoursByProject = dailyWorks.reduce((acc, work) => {
      const projectId = work.project_id;
      acc[projectId] = (acc[projectId] || 0) + (work.hours || 0);
      return acc;
    }, {});

    // Work distribution by employee
    const workByEmployee = dailyWorks.reduce((acc, work) => {
      const employeeId = work.employee_id;
      acc[employeeId] = (acc[employeeId] || 0) + 1;
      return acc;
    }, {});

    // Recent work trends (last 30 days)
    const last30Days = dayjs().subtract(30, 'days');
    const recentWorks = dailyWorks.filter(work => 
      dayjs(work.work_date).isAfter(last30Days)
    );

    // Daily work distribution for trends
    const dailyWorkTrends = recentWorks.reduce((acc, work) => {
      const date = dayjs(work.work_date).format('YYYY-MM-DD');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      totalWorks,
      totalHours,
      totalProjects,
      activeProjects,
      averageHoursPerWork: totalWorks > 0 ? (totalHours / totalWorks).toFixed(1) : 0,
      averageWorksPerProject: totalProjects > 0 ? (totalWorks / totalProjects).toFixed(1) : 0,
      workByProject,
      hoursByProject,
      workByEmployee,
      recentWorksCount: recentWorks.length,
      dailyWorkTrends
    };
  }, [dailyWorks, projects]);
};

/**
 * Hook for daily work form management
 * 
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and handlers
 */
export const useDailyWorkForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    description: '',
    hours: 0,
    work_date: dayjs().format('YYYY-MM-DD'),
    project_id: '',
    employee_id: '',
    work_type_id: '',
    notes: '',
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.description?.trim()) {
      newErrors.description = 'Work description is required';
    }
    
    if (!formData.hours || formData.hours <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }
    
    if (!formData.work_date) {
      newErrors.work_date = 'Work date is required';
    }
    
    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }
    
    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }
    
    // Business logic validation
    if (formData.work_date && dayjs(formData.work_date).isAfter(dayjs(), 'day')) {
      newErrors.work_date = 'Work date cannot be in the future';
    }
    
    if (formData.hours && formData.hours > 24) {
      newErrors.hours = 'Hours cannot exceed 24 per day';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      description: '',
      hours: 0,
      work_date: dayjs().format('YYYY-MM-DD'),
      project_id: '',
      employee_id: '',
      work_type_id: '',
      notes: '',
      ...initialData
    });
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateForm,
    resetForm,
    setIsSubmitting,
    setErrors
  };
};

/**
 * Hook for file operations (upload/download)
 * 
 * @returns {Object} File operation state and handlers
 */
export const useFileOperations = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const handleUpload = useCallback(async (file, endpoint) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Actual upload logic would go here
      // const response = await axios.post(endpoint, formData, {
      //   onUploadProgress: (progressEvent) => {
      //     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     setUploadProgress(progress);
      //   }
      // });

      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      setUploadError(error.message);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDownload = useCallback(async (endpoint, filename) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);

    try {
      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // Actual download logic would go here
      // const response = await axios.get(endpoint, {
      //   responseType: 'blob',
      //   onDownloadProgress: (progressEvent) => {
      //     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     setDownloadProgress(progress);
      //   }
      // });

      clearInterval(interval);
      setDownloadProgress(100);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);

    } catch (error) {
      setDownloadError(error.message);
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, []);

  return {
    uploadProgress,
    downloadProgress,
    isUploading,
    isDownloading,
    uploadError,
    downloadError,
    handleUpload,
    handleDownload
  };
};

/**
 * Hook for daily work summary filtering and analytics
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Summary filtering state and handlers
 */
export const useDailyWorkSummaryFiltering = ({ summary = [], inCharges = [] }) => {
  const [filterData, setFilterData] = useState({
    startDate: null,
    endDate: null,
    incharge: 'all'
  });
  const [isFiltering, setIsFiltering] = useState(false);

  // Available date range from summary data
  const availableDates = useMemo(() => {
    const dates = summary.map(work => dayjs(work.date));
    return {
      min: dates.length > 0 ? dayjs.min(...dates) : dayjs(),
      max: dates.length > 0 ? dayjs.max(...dates) : dayjs()
    };
  }, [summary]);

  // Initialize date range if not set
  React.useEffect(() => {
    if (!filterData.startDate && !filterData.endDate && summary.length > 0) {
      setFilterData(prev => ({
        ...prev,
        startDate: availableDates.min,
        endDate: availableDates.max
      }));
    }
  }, [summary, availableDates]);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    if (!filterData.startDate || !filterData.endDate) return summary;

    return summary.filter(work => {
      const workDate = dayjs(work.date);
      const dateInRange = workDate.isBetween(filterData.startDate, filterData.endDate, null, '[]');
      const matchesIncharge = filterData.incharge === 'all' || work.incharge === filterData.incharge;
      
      return dateInRange && matchesIncharge;
    });
  }, [summary, filterData]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setIsFiltering(true);
    setFilterData(prevState => ({
      ...prevState,
      [key]: value,
    }));
    
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 500);
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilterData({
      startDate: availableDates.min,
      endDate: availableDates.max,
      incharge: 'all'
    });
  }, [availableDates]);

  return {
    filteredData,
    filterData,
    availableDates,
    handleFilterChange,
    resetFilters,
    isFiltering
  };
};

/**
 * Hook for daily work summary statistics
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Summary statistics
 */
export const useDailyWorkSummaryStatistics = ({ data = [] }) => {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        totalProjects: 0,
        completionRate: 0,
        avgRFISubmissionRate: 0,
        workTypeBreakdown: {},
        dailyTrends: [],
        topPerformers: []
      };
    }

    const totalProjects = data.length;
    const totalCompleted = data.reduce((sum, item) => sum + (item.completed || 0), 0);
    const totalWorks = data.reduce((sum, item) => sum + (item.totalDailyWorks || 0), 0);
    const totalRFI = data.reduce((sum, item) => sum + (item.rfiSubmissions || 0), 0);

    const completionRate = totalWorks > 0 ? (totalCompleted / totalWorks) * 100 : 0;
    const avgRFISubmissionRate = totalCompleted > 0 ? (totalRFI / totalCompleted) * 100 : 0;

    // Work type breakdown
    const workTypeBreakdown = data.reduce((acc, item) => {
      ['embankment', 'structure', 'pavement'].forEach(type => {
        if (!acc[type]) {
          acc[type] = { count: 0, completed: 0, percentage: 0 };
        }
        acc[type].count += item[type] || 0;
        acc[type].completed += item.completed || 0;
      });
      return acc;
    }, {});

    // Calculate percentages for work types
    Object.keys(workTypeBreakdown).forEach(type => {
      const totalTypeWork = Object.values(workTypeBreakdown).reduce((sum, t) => sum + t.count, 0);
      workTypeBreakdown[type].percentage = totalTypeWork > 0 
        ? (workTypeBreakdown[type].count / totalTypeWork) * 100 
        : 0;
    });

    // Top performers (mock implementation)
    const topPerformers = data
      .filter(item => item.incharge)
      .map(item => ({
        incharge: item.incharge,
        name: `Employee ${item.incharge}`, // This would come from actual employee data
        completionRate: item.totalDailyWorks > 0 ? (item.completed / item.totalDailyWorks) * 100 : 0,
        totalWorks: item.totalDailyWorks || 0,
        completed: item.completed || 0
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    return {
      totalProjects,
      completionRate,
      avgRFISubmissionRate,
      workTypeBreakdown,
      dailyTrends: data,
      topPerformers
    };
  }, [data]);
};

/**
 * Hook for daily work summary export functionality
 * 
 * @returns {Object} Export functions and state
 */
export const useDailyWorkSummaryExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = useCallback(async ({ data, filters, filename }) => {
    setIsExporting(true);
    try {
      // Mock export implementation
      console.log('Exporting to Excel:', { data, filters, filename });
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This would typically call an API endpoint or use a library like SheetJS
      // to generate and download the Excel file
      
      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportToExcel,
    isExporting
  };
};

/**
 * Hook for project dashboard data management
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Dashboard data and functions
 */
export const useProjectDashboardData = ({ timeRange = 'week' } = {}) => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        lastUpdated: new Date().toISOString(),
        timeRange,
        // Mock dashboard data
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    dashboardData,
    loading,
    error,
    refresh
  };
};

/**
 * Hook for project statistics calculation
 * 
 * @param {Object} options - Data for calculations
 * @returns {Object} Project statistics
 */
export const useProjectStatistics = ({ projects = [], budgets = [], teams = [] }) => {
  return useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const delayedProjects = projects.filter(p => p.status === 'delayed').length;

    const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Mock budget calculations
    const budgetUtilization = budgets.length > 0 
      ? budgets.reduce((sum, b) => sum + (b.utilization || 0), 0) / budgets.length 
      : 75.5;

    // Mock team utilization
    const teamUtilization = teams.length > 0 
      ? teams.reduce((sum, t) => sum + (t.utilization || 0), 0) / teams.length 
      : 82.3;

    // Mock risk score calculation
    const riskScore = Math.min(10, Math.max(1, 
      (delayedProjects / Math.max(totalProjects, 1)) * 10 + 
      Math.random() * 2
    ));

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      delayedProjects,
      budgetUtilization,
      teamUtilization,
      completionRate,
      riskScore
    };
  }, [projects, budgets, teams]);
};

/**
 * Hook for project alerts management
 * 
 * @returns {Object} Alerts data and functions
 */
export const useProjectAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Budget Overrun Alert',
      message: 'Project Alpha is 15% over budget',
      severity: 'critical',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      title: 'Timeline Delay',
      message: 'Project Beta is behind schedule',
      severity: 'warning',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      title: 'Resource Shortage',
      message: 'Team capacity at 95%',
      severity: 'warning',
      timestamp: '1 day ago'
    }
  ]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    criticalCount,
    warningCount,
    markAsRead
  };
};

/**
 * Hook for real-time updates
 * 
 * @param {Object} options - Configuration options
 * @returns {Object} Connection state and data
 */
export const useRealTimeUpdates = ({ endpoint, onUpdate, enabled = true } = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  React.useEffect(() => {
    if (!enabled) return;

    // Mock WebSocket connection
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      
      // Simulate connection
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastUpdate(new Date().toISOString());
      }, 1000);

      // Simulate periodic updates
      const interval = setInterval(() => {
        if (onUpdate) {
          onUpdate({
            type: 'update',
            data: { timestamp: new Date().toISOString() }
          });
        }
        setLastUpdate(new Date().toISOString());
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(interval);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [endpoint, onUpdate, enabled]);

  return {
    isConnected,
    lastUpdate,
    connectionStatus
  };
};

/**
 * Export all hooks for convenient access
 */
export default {
  useDailyWorkFilter,
  useProjectStats,
  useDailyWorkForm,
  useFileOperations,
  useDailyWorkSummaryFiltering,
  useDailyWorkSummaryStatistics,
  useDailyWorkSummaryExport,
  useProjectDashboardData,
  useProjectStatistics,
  useProjectAlerts,
  useRealTimeUpdates
};
