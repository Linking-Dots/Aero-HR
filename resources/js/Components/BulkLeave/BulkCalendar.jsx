import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    CardHeader, 
    Button, 
    Chip, 
    IconButton, 
    Typography,
    CircularProgress
} from '@mui/material';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon,
    CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '@mui/material/styles';
import GlassCard from '@/Components/GlassCard';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

const BulkCalendar = ({ 
    selectedDates = [], 
    onDatesChange, 
    existingLeaves = [],
    publicHolidays = [],
    minDate = null,
    maxDate = null,
    userId = null,
    fetchFromAPI = false // Flag to determine if we should fetch data from API
}) => {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [apiCalendarData, setApiCalendarData] = useState({
        existingLeaves: existingLeaves,
        publicHolidays: publicHolidays
    });
    const [loading, setLoading] = useState(false);
    const [loadedYear, setLoadedYear] = useState(null); // Track which year's data is loaded

    // Fetch calendar data from API if enabled - optimized to load once per year
    const fetchCalendarData = useCallback(async (year) => {
        if (!fetchFromAPI || !userId) return;
        
        // Don't fetch if we already have data for this year
        if (loadedYear === year) return;
        
        setLoading(true);
        try {
            const response = await axios.get(route('leaves.bulk.calendar-data'), {
                params: {
                    user_id: userId,
                    year: year
                    // Removed month parameter to get full year data
                }
            });

            if (response.data.success) {
                setApiCalendarData({
                    existingLeaves: response.data.data.existingLeaves || [],
                    publicHolidays: response.data.data.publicHolidays || []
                });
                setLoadedYear(year); // Mark this year as loaded
            }
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
            // Keep existing data on error
        } finally {
            setLoading(false);
        }
    }, [fetchFromAPI, userId, loadedYear]);

    // Fetch data when component mounts or year changes
    useEffect(() => {
        const currentYear = currentDate.getFullYear();
        fetchCalendarData(currentYear);
    }, [fetchCalendarData, currentDate.getFullYear()]); // Only depend on year, not full date

    // Reset loaded year when user changes
    useEffect(() => {
        if (fetchFromAPI && userId) {
            setLoadedYear(null); // Reset to force reload for new user
        }
    }, [userId, fetchFromAPI]);

    // Use either API data or props data
    const finalExistingLeaves = fetchFromAPI ? apiCalendarData.existingLeaves : existingLeaves;
    const finalPublicHolidays = fetchFromAPI ? apiCalendarData.publicHolidays : publicHolidays;

    // Debug logs only when data changes (reduced logging)
    useEffect(() => {
        if (fetchFromAPI && !loading) {
            console.log('BulkCalendar - Calendar data loaded for year:', currentDate.getFullYear());
            console.log('BulkCalendar - Public holidays count:', finalPublicHolidays?.length || 0);
            console.log('BulkCalendar - Existing leaves count:', finalExistingLeaves?.length || 0);
        }
    }, [finalPublicHolidays, finalExistingLeaves, loading, fetchFromAPI, currentDate.getFullYear()]);

    // Get calendar days data for the current month
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayWeekday = firstDayOfMonth.getDay();
        
        // Previous month padding
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const prevMonthDays = [];
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            prevMonthDays.push({
                date: prevMonthLastDay - i,
                isCurrentMonth: false,
                fullDate: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }
        
        // Current month days
        const currentMonthDays = [];
        for (let day = 1; day <= daysInMonth; day++) {
            currentMonthDays.push({
                date: day,
                isCurrentMonth: true,
                fullDate: new Date(year, month, day)
            });
        }
        
        // Next month padding
        const totalCells = prevMonthDays.length + currentMonthDays.length;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days
        const nextMonthDays = [];
        for (let day = 1; day <= remainingCells; day++) {
            nextMonthDays.push({
                date: day,
                isCurrentMonth: false,
                fullDate: new Date(year, month + 1, day)
            });
        }
        
        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }, [currentDate]);

    // Navigation handlers
    const goToPreviousMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const goToNextMonth = useCallback(() => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const goToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    // Date selection handler - disabled during loading, holidays, and existing leaves
    const handleDateClick = useCallback((dayData) => {
        if (!dayData.isCurrentMonth || loading) return; // Block interaction during loading
        
        // Use consistent date formatting to avoid timezone issues
        const dateString = dayData.fullDate.getFullYear() + '-' + 
                          String(dayData.fullDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(dayData.fullDate.getDate()).padStart(2, '0');
        
        // Check for holidays and existing leaves first
        const hasExistingLeave = finalExistingLeaves.some(leave => {
            if (!leave.from_date || !leave.to_date) return false;
            const fromDate = leave.from_date.split('T')[0];
            const toDate = leave.to_date.split('T')[0];
            return dateString >= fromDate && dateString <= toDate;
        });
        
        const isPublicHoliday = finalPublicHolidays.includes(dateString);
        
        // Prevent selection of holidays and existing leaves
        if (hasExistingLeave || isPublicHoliday) return;
        
        // Check if date is selectable
        if (minDate && dayData.fullDate < new Date(minDate)) return;
        if (maxDate && dayData.fullDate > new Date(maxDate)) return;
        // Allow past dates for bulk leave requests (removed restriction)
        
        // Toggle selection
        const isSelected = selectedDates.includes(dateString);
        let newSelectedDates;
        
        if (isSelected) {
            newSelectedDates = selectedDates.filter(date => date !== dateString);
        } else {
            newSelectedDates = [...selectedDates, dateString];
        }
        
        onDatesChange(newSelectedDates.sort());
    }, [selectedDates, onDatesChange, minDate, maxDate, loading, finalExistingLeaves, finalPublicHolidays]);

    // Get date status
    const getDateStatus = useCallback((dayData) => {
        if (!dayData.isCurrentMonth) return { selectable: false };
        
        // Use consistent date formatting (YYYY-MM-DD) and avoid timezone issues
        const dateString = dayData.fullDate.getFullYear() + '-' + 
                          String(dayData.fullDate.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(dayData.fullDate.getDate()).padStart(2, '0');
        
        const isSelected = selectedDates.includes(dateString);
        const isToday = dayData.fullDate.toDateString() === new Date().toDateString();
        const isPast = dayData.fullDate < new Date().setHours(0, 0, 0, 0);
        const isWeekend = dayData.fullDate.getDay() === 0 || dayData.fullDate.getDay() === 6;
        
        // Check for existing leave - improved detection with better date comparison
        const hasExistingLeave = finalExistingLeaves.some(leave => {
            if (!leave.from_date || !leave.to_date) return false;
            
            // Normalize dates to YYYY-MM-DD format and handle timezone properly
            const fromDate = leave.from_date.split('T')[0]; // Get just the date part
            const toDate = leave.to_date.split('T')[0]; // Get just the date part
            
            // Debug log for existing leaves (only when debugging specific issues)
            // console.log(`Checking existing leave for ${dateString}: from ${fromDate} to ${toDate}, match: ${dateString >= fromDate && dateString <= toDate}`);
            
            return dateString >= fromDate && dateString <= toDate;
        });
        
        // Check for public holiday - direct string comparison
        const isPublicHoliday = finalPublicHolidays.includes(dateString);
        
        // Debug log for holiday detection (only when debugging specific issues)
        // console.log(`${dateString}: isPublicHoliday=${isPublicHoliday}, finalPublicHolidays includes check:`, finalPublicHolidays.includes(dateString));
        
        // Allow selection of past dates for bulk leave (removed isPast restriction)
        // Disable selectability during loading, for holidays, and existing leaves
        const selectable = !loading && 
                          !hasExistingLeave && 
                          !isPublicHoliday &&
                          (!minDate || dayData.fullDate >= new Date(minDate)) &&
                          (!maxDate || dayData.fullDate <= new Date(maxDate));
        
        return {
            isSelected,
            isToday,
            isPast,
            isWeekend,
            hasExistingLeave,
            isPublicHoliday,
            selectable
        };
    }, [selectedDates, finalExistingLeaves, finalPublicHolidays, minDate, maxDate, loading]);

    // Get date cell classes with consistent theming and loading state
    const getDateCellClasses = useCallback((dayData, status) => {
        if (!dayData.isCurrentMonth) {
            return {
                color: theme.palette.text.disabled,
                cursor: 'not-allowed',
                opacity: 0.3
            };
        }
        
        // Apply loading state styling
        if (loading) {
            return {
                color: theme.palette.text.disabled,
                cursor: 'not-allowed',
                backgroundColor: theme.palette.action.disabledBackground,
                opacity: 0.5,
                pointerEvents: 'none'
            };
        }
        
        // Priority order: Selected > Existing Leave > Holiday > Today > Weekend > Default
        if (status.isSelected) {
            return {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold',
                border: `2px solid ${theme.palette.primary.dark}`,
                boxShadow: `0 0 0 3px ${theme.palette.primary.main}30`,
                transform: 'scale(1.05)',
                zIndex: 10
            };
        } else if (status.hasExistingLeave) {
            return {
                backgroundColor: theme.palette.error.main,
                color: theme.palette.error.contrastText,
                border: `2px solid ${theme.palette.error.dark}`,
                fontWeight: 500,
                cursor: 'not-allowed'
            };
        } else if (status.isPublicHoliday) {
            return {
                backgroundColor: theme.palette.warning.main,
                color: theme.palette.warning.contrastText,
                border: `2px solid ${theme.palette.warning.dark}`,
                fontWeight: 500,
                cursor: 'not-allowed'
            };
        } else if (status.isToday) {
            return {
                backgroundColor: theme.palette.secondary.light,
                color: theme.palette.secondary.contrastText,
                fontWeight: 600,
                border: `2px solid ${theme.palette.secondary.main}`,
                boxShadow: `0 0 0 2px ${theme.palette.secondary.main}40`,
                '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                    transform: 'scale(1.02)'
                }
            };
        } else if (status.isWeekend) {
            return {
                color: theme.palette.text.secondary,
                backgroundColor: theme.palette.action.hover,
                border: `1px solid ${theme.palette.divider}`,
                opacity: 0.7,
                '&:hover': {
                    backgroundColor: theme.palette.action.selected,
                    opacity: 0.9
                }
            };
        } else if (!status.selectable) {
            // Only apply disabled styling for other non-selectable dates (not holidays/existing leaves)
            return {
                color: theme.palette.text.disabled,
                cursor: 'not-allowed',
                backgroundColor: theme.palette.action.disabledBackground,
                opacity: 0.6
            };
        } else {
            return {
                color: theme.palette.text.primary,
                border: `1px solid transparent`,
                '&:hover': {
                    backgroundColor: theme.palette.primary.main + '15',
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}30`,
                    transform: 'scale(1.02)'
                }
            };
        }
    }, [theme, loading]);

    const monthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <GlassCard variant="outlined" sx={{ width: '100%' }}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarDaysIcon style={{ width: 20, height: 20, color: theme.palette.primary.main }} />
                            <Typography variant="h6" component="h3">
                                {monthYear}
                            </Typography>
                            {fetchFromAPI && loadedYear && (
                                <Chip 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary" 
                                    label={`Data: ${loadedYear}`}
                                    sx={{ ml: 1, fontSize: '0.7rem' }}
                                />
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                                size="small"
                                onClick={goToPreviousMonth}
                                sx={{ color: 'text.secondary' }}
                                disabled={loading}
                            >
                                <ChevronLeftIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                            <Button
                                variant="text"
                                size="small"
                                onClick={goToToday}
                                sx={{ 
                                    minWidth: 'auto', 
                                    px: 1.5, 
                                    py: 0.5, 
                                    fontSize: '0.75rem',
                                    textTransform: 'none'
                                }}
                                disabled={loading}
                            >
                                Today
                            </Button>
                            <IconButton
                                size="small"
                                onClick={goToNextMonth}
                                sx={{ color: 'text.secondary' }}
                                disabled={loading}
                            >
                                <ChevronRightIcon style={{ width: 16, height: 16 }} />
                            </IconButton>
                        </Box>
                    </Box>
                }
                sx={{ pb: 2 }}
            />
            <CardContent sx={{ pt: 0 }}>
                {loading && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        py: 3,
                        backgroundColor: theme.palette.action.hover,
                        borderRadius: 2,
                        mb: 3
                    }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                            Loading calendar data for {currentDate.getFullYear()}...
                        </Typography>
                    </Box>
                )}
                
                {/* Legend with consistent chip colors */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip 
                        size="small" 
                        variant="filled" 
                        color="primary" 
                        label="Selected" 
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                        size="small" 
                        variant="filled" 
                        color="error" 
                        label="Existing Leave" 
                        sx={{ opacity: 0.9 }}
                    />
                    <Chip 
                        size="small" 
                        variant="filled" 
                        color="warning" 
                        label="Holiday" 
                        sx={{ opacity: 0.9 }}
                    />
                    <Chip 
                        size="small" 
                        variant="filled" 
                        color="secondary" 
                        label="Today" 
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                        size="small" 
                        variant="outlined" 
                        color="default" 
                        label="Weekend" 
                        sx={{ opacity: 0.7 }}
                    />
                </Box>
                
                {/* Week days header */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
                    {weekDays.map(day => (
                        <Box 
                            key={day} 
                            sx={{ 
                                textAlign: 'center', 
                                py: 1,
                                fontSize: '0.875rem',
                                fontWeight: 'medium',
                                color: 'text.secondary'
                            }}
                        >
                            {day}
                        </Box>
                    ))}
                </Box>
                
                {/* Calendar grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                    {calendarDays.map((dayData, index) => {
                        const status = getDateStatus(dayData);
                        const cellStyles = getDateCellClasses(dayData, status);
                        
                        return (
                            <Box
                                key={index}
                                onClick={() => handleDateClick(dayData)}
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 40,
                                    height: 40,
                                    minHeight: 40,
                                    cursor: status.selectable ? 'pointer' : 'not-allowed',
                                    borderRadius: 1.5,
                                    transition: 'all 0.2s ease-in-out',
                                    fontSize: '0.875rem',
                                    userSelect: 'none',
                                    ...cellStyles
                                }}
                                role="button"
                                tabIndex={status.selectable ? 0 : -1}
                                title={status.hasExistingLeave ? 'Existing leave - cannot select' : 
                                       status.isPublicHoliday ? 'Public holiday - cannot select' : 
                                       !status.selectable ? 'Not selectable' : ''}
                                aria-label={`${dayData.fullDate.toDateString()}${status.isSelected ? ' (selected)' : ''}${status.hasExistingLeave ? ' (existing leave)' : ''}${status.isPublicHoliday ? ' (public holiday)' : ''}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleDateClick(dayData);
                                    }
                                }}
                            >
                                {dayData.date}
                                
                                {/* Only weekend indicator for clean visual hierarchy */}
                                {status.isWeekend && !status.isSelected && !status.hasExistingLeave && !status.isPublicHoliday && (
                                    <Box 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 2, 
                                            right: 2, 
                                            width: 4, 
                                            height: 4, 
                                            borderRadius: '50%', 
                                            bgcolor: 'text.secondary',
                                            opacity: 0.5
                                        }} 
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
                
                {/* Enhanced selection summary */}
                {selectedDates.length > 0 && (
                    <Box 
                        sx={{ 
                            mt: 3, 
                            p: 2.5, 
                            borderRadius: 2, 
                            background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
                            border: `1px solid ${theme.palette.primary.main}30`,
                            backdropFilter: 'blur(8px)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="body2" color="primary.main" fontWeight="600" sx={{ mb: 1 }}>
                                📅 {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selectedDates.slice(0, 12).map(date => (
                                    <Chip 
                                        key={date} 
                                        size="small" 
                                        variant="filled" 
                                        color="primary"
                                        label={new Date(date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                        sx={{ 
                                            fontWeight: 500,
                                            fontSize: '0.75rem'
                                        }}
                                    />
                                ))}
                                {selectedDates.length > 12 && (
                                    <Chip 
                                        size="small" 
                                        variant="outlined"
                                        color="primary"
                                        label={`+${selectedDates.length - 12} more`}
                                        sx={{ fontWeight: 500 }}
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        {/* Subtle background pattern */}
                        <Box 
                            sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}15, transparent)`,
                                opacity: 0.3
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </GlassCard>
    );
};

export default BulkCalendar;
