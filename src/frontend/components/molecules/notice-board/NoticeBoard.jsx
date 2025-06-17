/**
 * NoticeBoard Molecule Component
 * 
 * A notice board component that displays announcements and allows users
 * to add new notices. Features glass morphism design, CRUD operations,
 * and responsive layout.
 * 
 * Features:
 * - Display notices in grid layout
 * - Add new notices with dialog
 * - Delete existing notices
 * - Glass morphism styling
 * - Responsive design
 * - Accessibility support
 * - Date formatting
 * 
 * @component
 * @example
 * ```jsx
 * <NoticeBoard
 *   notices={notices}
 *   onAddNotice={handleAddNotice}
 *   onDeleteNotice={handleDeleteNotice}
 *   allowAdd={true}
 *   allowDelete={true}
 * />
 * ```
 */

import React from 'react';
import { useTheme } from '@mui/material/styles';

import { NoticeBoardCore } from './components';
import { useNoticeBoard } from './hooks';
import { NOTICE_BOARD_CONFIG } from './config';

const NoticeBoard = ({
  initialNotices = [],
  onAddNotice,
  onDeleteNotice,
  allowAdd = true,
  allowDelete = false,
  maxNotices = 10,
  className = '',
  style = {}
}) => {
  const theme = useTheme();
  
  const {
    notices,
    dialogOpen,
    newNotice,
    handleAddNotice,
    handleDeleteNotice,
    handleDialogOpen,
    handleDialogClose,
    handleInputChange,
    isFormValid
  } = useNoticeBoard({
    initialNotices,
    onAddNotice,
    onDeleteNotice,
    maxNotices,
    config: NOTICE_BOARD_CONFIG
  });

  return (
    <NoticeBoardCore
      notices={notices}
      dialogOpen={dialogOpen}
      newNotice={newNotice}
      allowAdd={allowAdd}
      allowDelete={allowDelete}
      onAddNotice={handleAddNotice}
      onDeleteNotice={handleDeleteNotice}
      onDialogOpen={handleDialogOpen}
      onDialogClose={handleDialogClose}
      onInputChange={handleInputChange}
      isFormValid={isFormValid}
      theme={theme}
      className={className}
      style={style}
      config={NOTICE_BOARD_CONFIG}
    />
  );
};

export default NoticeBoard;
