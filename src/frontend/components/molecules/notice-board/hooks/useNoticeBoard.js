/**
 * Notice Board Custom Hook
 * 
 * Manages notice board state, CRUD operations, and form validation.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

export const useNoticeBoard = ({
  initialNotices = [],
  onAddNotice,
  onDeleteNotice,
  maxNotices = 10,
  config
}) => {
  const [notices, setNotices] = useState(initialNotices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState(config.defaultNotice);

  // Update notices when initialNotices changes
  useEffect(() => {
    setNotices(initialNotices);
  }, [initialNotices]);

  // Form validation
  const isFormValid = useMemo(() => {
    const { title, description } = newNotice;
    const titleValid = title.length >= config.validation.title.minLength && 
                      title.length <= config.validation.title.maxLength;
    const descriptionValid = description.length >= config.validation.description.minLength && 
                            description.length <= config.validation.description.maxLength;
    
    return titleValid && descriptionValid;
  }, [newNotice, config.validation]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle adding notice
  const handleAddNotice = useCallback(() => {
    if (!isFormValid) return;

    const notice = {
      ...newNotice,
      id: Date.now(),
      date: new Date()
    };

    // Update local state
    setNotices(prev => {
      const updated = [notice, ...prev];
      return updated.slice(0, maxNotices); // Limit to maxNotices
    });

    // Call external handler if provided
    if (onAddNotice) {
      onAddNotice(notice);
    }

    // Reset form and close dialog
    setNewNotice(config.defaultNotice);
    setDialogOpen(false);
  }, [newNotice, isFormValid, onAddNotice, maxNotices, config.defaultNotice]);

  // Handle deleting notice
  const handleDeleteNotice = useCallback((id) => {
    setNotices(prev => prev.filter(notice => notice.id !== id));
    
    // Call external handler if provided
    if (onDeleteNotice) {
      onDeleteNotice(id);
    }
  }, [onDeleteNotice]);

  // Dialog controls
  const handleDialogOpen = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setNewNotice(config.defaultNotice);
  }, [config.defaultNotice]);

  // Notice utilities
  const getNoticeById = useCallback((id) => {
    return notices.find(notice => notice.id === id);
  }, [notices]);

  const getNoticesByDate = useCallback((date) => {
    return notices.filter(notice => {
      const noticeDate = new Date(notice.date);
      const targetDate = new Date(date);
      return noticeDate.toDateString() === targetDate.toDateString();
    });
  }, [notices]);

  const sortNoticesByDate = useCallback((ascending = false) => {
    return [...notices].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }, [notices]);

  return {
    notices,
    dialogOpen,
    newNotice,
    isFormValid,
    handleAddNotice,
    handleDeleteNotice,
    handleDialogOpen,
    handleDialogClose,
    handleInputChange,
    getNoticeById,
    getNoticesByDate,
    sortNoticesByDate
  };
};
