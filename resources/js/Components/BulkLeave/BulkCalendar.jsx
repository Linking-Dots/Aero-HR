import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@heroui/react';
import { 
    ChevronLeftIcon, 
    ChevronRightIcon,
    CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import { useTheme } from '@mui/material/styles';

const BulkCalendar = ({ 
    selectedDates = [], 
    onDatesChange, 
    existingLeaves = [],
    publicHolidays = [],
    minDate = null,
    maxDate = null 
}) => {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get calendar data for the current month
    const calendarData = useMemo(() => {
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

    // Date selection handler
    const handleDateClick = useCallback((dayData) => {
        if (!dayData.isCurrentMonth) return;
        
        const dateString = dayData.fullDate.toISOString().split('T')[0];
        
        // Check if date is selectable
        if (minDate && dayData.fullDate < new Date(minDate)) return;
        if (maxDate && dayData.fullDate > new Date(maxDate)) return;
        if (dayData.fullDate < new Date().setHours(0, 0, 0, 0)) return; // No past dates
        
        // Toggle selection
        const isSelected = selectedDates.includes(dateString);
        let newSelectedDates;
        
        if (isSelected) {
            newSelectedDates = selectedDates.filter(date => date !== dateString);
        } else {
            newSelectedDates = [...selectedDates, dateString];
        }
        
        onDatesChange(newSelectedDates.sort());
    }, [selectedDates, onDatesChange, minDate, maxDate]);

    // Get date status
    const getDateStatus = useCallback((dayData) => {
        if (!dayData.isCurrentMonth) return { selectable: false };
        
        const dateString = dayData.fullDate.toISOString().split('T')[0];
        const isSelected = selectedDates.includes(dateString);
        const isToday = dayData.fullDate.toDateString() === new Date().toDateString();
        const isPast = dayData.fullDate < new Date().setHours(0, 0, 0, 0);
        const isWeekend = dayData.fullDate.getDay() === 0 || dayData.fullDate.getDay() === 6;
        const hasExistingLeave = existingLeaves.some(leave => 
            leave.from_date <= dateString && leave.to_date >= dateString
        );
        const isPublicHoliday = publicHolidays.includes(dateString);
        
        const selectable = !isPast && 
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
    }, [selectedDates, existingLeaves, publicHolidays, minDate, maxDate]);

    // Get date cell classes
    const getDateCellClasses = useCallback((dayData, status) => {
        const baseClasses = "w-10 h-10 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all duration-200 relative";
        
        if (!dayData.isCurrentMonth) {
            return `${baseClasses} text-default-300 cursor-not-allowed`;
        }
        
        if (!status.selectable) {
            return `${baseClasses} text-default-300 cursor-not-allowed bg-default-100`;
        }
        
        let classes = baseClasses;
        
        if (status.isSelected) {
            classes += " bg-primary text-primary-foreground font-semibold ring-2 ring-primary/30";
        } else if (status.isToday) {
            classes += " bg-secondary/20 text-secondary font-medium border-2 border-secondary";
        } else if (status.hasExistingLeave) {
            classes += " bg-danger/20 text-danger border border-danger/50";
        } else if (status.isPublicHoliday) {
            classes += " bg-warning/20 text-warning border border-warning/50";
        } else if (status.isWeekend) {
            classes += " text-default-500 hover:bg-default-100";
        } else {
            classes += " hover:bg-primary/10 hover:text-primary";
        }
        
        return classes;
    }, []);

    const monthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">{monthYear}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={goToPreviousMonth}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="flat"
                        size="sm"
                        onPress={goToToday}
                        className="text-xs px-3"
                    >
                        Today
                    </Button>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={goToNextMonth}
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardBody className="pt-0">
                {/* Legend */}
                <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <Chip size="sm" variant="flat" color="primary">Selected</Chip>
                    <Chip size="sm" variant="flat" color="danger">Existing Leave</Chip>
                    <Chip size="sm" variant="flat" color="warning">Holiday</Chip>
                    <Chip size="sm" variant="flat" color="secondary">Today</Chip>
                </div>
                
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-default-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarData.map((dayData, index) => {
                        const status = getDateStatus(dayData);
                        const cellClasses = getDateCellClasses(dayData, status);
                        
                        return (
                            <div
                                key={index}
                                className={cellClasses}
                                onClick={() => handleDateClick(dayData)}
                                role="button"
                                tabIndex={status.selectable ? 0 : -1}
                                aria-label={`${dayData.fullDate.toDateString()}${status.isSelected ? ' (selected)' : ''}${status.hasExistingLeave ? ' (has existing leave)' : ''}${status.isPublicHoliday ? ' (public holiday)' : ''}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleDateClick(dayData);
                                    }
                                }}
                            >
                                {dayData.date}
                                
                                {/* Indicators */}
                                {status.hasExistingLeave && (
                                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-danger"></div>
                                )}
                                {status.isPublicHoliday && (
                                    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-warning"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Selection summary */}
                {selectedDates.length > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/10">
                        <p className="text-sm text-primary font-medium">
                            {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedDates.slice(0, 10).map(date => (
                                <Chip key={date} size="sm" variant="flat" color="primary">
                                    {new Date(date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </Chip>
                            ))}
                            {selectedDates.length > 10 && (
                                <Chip size="sm" variant="flat">
                                    +{selectedDates.length - 10} more
                                </Chip>
                            )}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default BulkCalendar;
