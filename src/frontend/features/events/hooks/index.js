/**
 * Events Feature Hooks Export
 * 
 * @file hooks/index.js
 * @description Custom hooks for events and activities feature functionality
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @exports
 * - Data management hooks
 * - Filtering and search hooks
 * - Team management hooks
 * - Events utility hooks
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for picnic participants filtering functionality
 */
export const usePicnicFiltering = (data, filterData) => {
  const [filteredParticipants, setFilteredParticipants] = useState(data);

  const applyFilters = useCallback(() => {
    let filtered = [...data];

    // Apply team filter
    if (filterData.team && filterData.team !== 'all') {
      filtered = filtered.filter(participant => participant.team === filterData.team);
    }

    // Apply payment status filter
    if (filterData.paymentStatus && filterData.paymentStatus !== 'all') {
      filtered = filtered.filter(participant => participant.payment_status === filterData.paymentStatus);
    }

    // Apply registration date filter
    if (filterData.registrationDate) {
      filtered = filtered.filter(participant => {
        const regDate = new Date(participant.created_at);
        const filterDate = new Date(filterData.registrationDate);
        return regDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredParticipants(filtered);
  }, [data, filterData]);

  const resetFilters = useCallback(() => {
    setFilteredParticipants(data);
  }, [data]);

  return {
    filteredParticipants,
    applyFilters,
    resetFilters
  };
};

/**
 * Hook for picnic statistics calculation
 */
export const usePicnicStats = (data) => {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    teams: 0,
    totalAmount: 0
  });

  const calculateStats = useCallback((participantsData) => {
    const newStats = {
      total: participantsData.length,
      paid: participantsData.filter(p => p.payment_status === 'paid').length,
      pending: participantsData.filter(p => p.payment_status === 'pending').length,
      teams: new Set(participantsData.map(p => p.team).filter(Boolean)).size,
      totalAmount: participantsData.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0)
    };
    setStats(newStats);
  }, []);

  return {
    stats,
    calculateStats
  };
};

/**
 * Hook for team management functionality
 */
export const useTeamManagement = (participants) => {
  const [teams, setTeams] = useState({});

  const organizeTeams = useCallback(() => {
    const teamOrganization = participants.reduce((acc, participant) => {
      const team = participant.team || 'unassigned';
      if (!acc[team]) {
        acc[team] = [];
      }
      acc[team].push(participant);
      return acc;
    }, {});
    
    setTeams(teamOrganization);
    return teamOrganization;
  }, [participants]);

  const balanceTeams = useCallback((targetTeamsCount = 3) => {
    const unassigned = participants.filter(p => !p.team);
    const teamsArray = Array.from({ length: targetTeamsCount }, (_, i) => ({ 
      id: `team${i + 1}`, 
      members: [],
      name: `Team ${i + 1}`
    }));

    // Distribute unassigned participants evenly
    unassigned.forEach((participant, index) => {
      const teamIndex = index % targetTeamsCount;
      teamsArray[teamIndex].members.push(participant);
    });

    return teamsArray;
  }, [participants]);

  const getTeamRecommendation = useCallback((participantId) => {
    const currentTeams = organizeTeams();
    const teamSizes = Object.values(currentTeams).map(team => team.length);
    const minSize = Math.min(...teamSizes);
    
    // Find team with minimum size
    const recommendedTeam = Object.keys(currentTeams).find(teamKey => 
      currentTeams[teamKey].length === minSize
    );
    
    return recommendedTeam || 'team1';
  }, [organizeTeams]);

  return {
    teams,
    organizeTeams,
    balanceTeams,
    getTeamRecommendation
  };
};

/**
 * Hook for events calendar functionality
 */
export const useEventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const addEvent = useCallback((eventData) => {
    setEvents(prev => [...prev, { ...eventData, id: Date.now() }]);
  }, []);

  const updateEvent = useCallback((eventId, eventData) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...eventData } : event
    ));
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  }, []);

  const getEventsForDate = useCallback((date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  return {
    events,
    selectedDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate
  };
};

/**
 * Hook for activity management
 */
export const useActivityManagement = () => {
  const [activities, setActivities] = useState([]);

  const addActivity = useCallback((activityData) => {
    setActivities(prev => [...prev, { ...activityData, id: Date.now() }]);
  }, []);

  const updateActivity = useCallback((activityId, activityData) => {
    setActivities(prev => prev.map(activity => 
      activity.id === activityId ? { ...activity, ...activityData } : activity
    ));
  }, []);

  const deleteActivity = useCallback((activityId) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  }, []);

  const getActivitiesByType = useCallback((type) => {
    return activities.filter(activity => activity.type === type);
  }, [activities]);

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    getActivitiesByType
  };
};

/**
 * Hook for events form management
 */
export const useEventsForm = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Add validation rules here
    if (!formData.name) {
      newErrors.name = 'Event name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }

    if (!formData.location) {
      newErrors.location = 'Event location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setLoading(false);
  }, [initialData]);

  return {
    formData,
    errors,
    loading,
    updateField,
    validateForm,
    resetForm,
    setLoading
  };
};

/**
 * Events feature hooks collection
 */
export const EVENTS_HOOKS = {
  filtering: {
    usePicnicFiltering: 'Filter and search picnic participants data',
    useEventsCalendar: 'Manage events calendar functionality'
  },
  
  statistics: {
    usePicnicStats: 'Calculate picnic statistics and metrics',
    useActivityManagement: 'Manage event activities and scheduling'
  },
  
  management: {
    useTeamManagement: 'Handle team organization and balancing',
    useEventsForm: 'Manage events form state and validation'
  }
};

export default EVENTS_HOOKS;
