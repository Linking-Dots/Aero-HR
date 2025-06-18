/**
 * Daily Works Page Component
 * 
 * @file DailyWorksPage.jsx
 * @description Main daily works management page for project tracking and work logging
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Daily work entry and tracking
 * - Project work filtering and search
 * - Excel upload/download functionality
 * - Work summary and analytics
 * - Employee work assignment
 * - Material-UI with responsive design
 * 
 * @dependencies
 * - React 18+
 * - Inertia.js
 * - Material-UI
 * - Day.js for date handling
 * - Axios for file operations
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Box,
    CardContent,
    CardHeader, 
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    TextField,
    useMediaQuery,
    Typography,
    Fade,
    Grow
} from '@mui/material';
import { AddBox, Download, Upload } from '@mui/icons-material';
import { Head } from "@inertiajs/react";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import axios from "axios";

// Layout and Components
import App from "@/Layouts/App.jsx";
import GlassCard from "@/Components/GlassCard.jsx";

// Feature Components
import DailyWorksTable from '@/Components/organisms/DailyWorksTable';
import { DailyWorkForm } from '@molecules/daily-work-form';
import { DeleteDailyWorkForm } from '@molecules/delete-daily-work-form';
import DailyWorksDownloadForm from "@/Components/molecules/DailyWorksDownloadForm";
import DailyWorksUploadForm from "@/Components/molecules/DailyWorksUploadForm";

// Enable dayjs plugins
dayjs.extend(minMax);

/**
 * Daily Works Page Component
 * 
 * Central hub for daily work management including entry, tracking,
 * filtering, and file operations for construction project management.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {Array} props.dailyWorks - Daily work entries
 * @param {Array} props.employees - Employee list
 * @param {Array} props.projects - Project list
 * @param {Array} props.workTypes - Available work types
 * @returns {JSX.Element} Daily works management page
 */
const DailyWorksPage = ({ 
  title, 
  dailyWorks, 
  employees, 
  projects, 
  workTypes 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [showDownloadForm, setShowDownloadForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  // Filtered data based on search and filters
  const filteredWorks = useMemo(() => {
    return dailyWorks?.filter(work => {
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
      
      return matchesSearch && matchesProject && matchesEmployee && 
             matchesWorkType && matchesDate;
    }) || [];
  }, [dailyWorks, searchTerm, selectedProject, selectedEmployee, selectedWorkType, selectedDate]);

  // Search handler
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  // Filter handlers
  const handleProjectFilter = useCallback((event) => {
    setSelectedProject(event.target.value);
  }, []);

  const handleEmployeeFilter = useCallback((event) => {
    setSelectedEmployee(event.target.value);
  }, []);

  const handleWorkTypeFilter = useCallback((event) => {
    setSelectedWorkType(event.target.value);
  }, []);

  const handleDateFilter = useCallback((event) => {
    setSelectedDate(event.target.value);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedProject('');
    setSelectedEmployee('');
    setSelectedWorkType('');
    setSelectedDate('');
  }, []);

  // Form handlers
  const handleAddWork = useCallback(() => {
    setSelectedWork(null);
    setShowAddForm(true);
  }, []);

  const handleEditWork = useCallback((work) => {
    setSelectedWork(work);
    setShowAddForm(true);
  }, []);

  const handleDeleteWork = useCallback((work) => {
    setSelectedWork(work);
    setShowDeleteForm(true);
  }, []);

  const handleDownload = useCallback(() => {
    setShowDownloadForm(true);
  }, []);

  const handleUpload = useCallback(() => {
    setShowUploadForm(true);
  }, []);

  // Close form handlers
  const handleCloseAddForm = useCallback(() => {
    setShowAddForm(false);
    setSelectedWork(null);
  }, []);

  const handleCloseDeleteForm = useCallback(() => {
    setShowDeleteForm(false);
    setSelectedWork(null);
  }, []);

  const handleCloseDownloadForm = useCallback(() => {
    setShowDownloadForm(false);
  }, []);

  const handleCloseUploadForm = useCallback(() => {
    setShowUploadForm(false);
  }, []);

  // Statistics
  const totalWorks = dailyWorks?.length || 0;
  const filteredCount = filteredWorks.length;
  const totalHours = filteredWorks.reduce((sum, work) => sum + (work.hours || 0), 0);
  const avgHoursPerWork = filteredCount > 0 ? (totalHours / filteredCount).toFixed(1) : 0;

  return (
    <App title={title}>
      <Head title={title} />
      
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
        py: 3,
        px: { xs: 2, md: 3 }
      }}>
        {/* Page Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1"
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #f59e0b 30%, #f97316 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Daily Works Management
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Track daily work activities, manage project tasks, and monitor team productivity
            </Typography>

            {/* Statistics Cards */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(4, 1fr)' 
              }, 
              gap: 2, 
              mb: 3 
            }}>
              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <AddBox sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalWorks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Works
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <SearchIcon sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {filteredCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Filtered Results
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography variant="h6" color="white">H</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {totalHours}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>

              <GlassCard>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    <Typography variant="h6" color="white">A</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {avgHoursPerWork}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Hours/Work
                    </Typography>
                  </Box>
                </Box>
              </GlassCard>
            </Box>
          </Box>
        </Fade>

        {/* Action Bar and Filters */}
        <Grow in timeout={1000}>
          <GlassCard sx={{ mb: 3 }}>
            <CardHeader
              title="Daily Works"
              action={
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <IconButton
                    color="primary"
                    onClick={handleAddWork}
                    title="Add New Work"
                  >
                    <AddBox />
                  </IconButton>
                  <IconButton
                    color="success"
                    onClick={handleDownload}
                    title="Download Excel"
                  >
                    <Download />
                  </IconButton>
                  <IconButton
                    color="warning"
                    onClick={handleUpload}
                    title="Upload Excel"
                  >
                    <Upload />
                  </IconButton>
                </Box>
              }
            />
            
            <CardContent>
              {/* Filters Grid */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Works"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Project</InputLabel>
                    <TextField
                      select
                      value={selectedProject}
                      onChange={handleProjectFilter}
                      label="Project"
                    >
                      <MenuItem value="">All Projects</MenuItem>
                      {projects?.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employee</InputLabel>
                    <TextField
                      select
                      value={selectedEmployee}
                      onChange={handleEmployeeFilter}
                      label="Employee"
                    >
                      <MenuItem value="">All Employees</MenuItem>
                      {employees?.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Work Type</InputLabel>
                    <TextField
                      select
                      value={selectedWorkType}
                      onChange={handleWorkTypeFilter}
                      label="Work Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {workTypes?.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Date"
                    value={selectedDate}
                    onChange={handleDateFilter}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={1}>
                  <IconButton
                    onClick={clearFilters}
                    title="Clear Filters"
                    color="warning"
                    disabled={!searchTerm && !selectedProject && !selectedEmployee && !selectedWorkType && !selectedDate}
                  >
                    ×
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </GlassCard>
        </Grow>

        {/* Daily Works Table */}
        <Grow in timeout={1200}>
          <GlassCard>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <DailyWorksTable
                dailyWorks={filteredWorks}
                employees={employees}
                projects={projects}
                workTypes={workTypes}
                onEdit={handleEditWork}
                onDelete={handleDeleteWork}
              />
            )}
          </GlassCard>
        </Grow>

        {/* Forms */}
        {showAddForm && (
          <DailyWorkForm
            work={selectedWork}
            employees={employees}
            projects={projects}
            workTypes={workTypes}
            onClose={handleCloseAddForm}
          />
        )}

        {showDeleteForm && selectedWork && (
          <DeleteDailyWorkForm
            work={selectedWork}
            onClose={handleCloseDeleteForm}
          />
        )}

        {showDownloadForm && (
          <DailyWorksDownloadForm
            onClose={handleCloseDownloadForm}
          />
        )}

        {showUploadForm && (
          <DailyWorksUploadForm
            onClose={handleCloseUploadForm}
          />
        )}
      </Box>
    </App>
  );
};

export default DailyWorksPage;
