/**
 * LettersTable Organism
 * 
 * A comprehensive correspondence management table for tracking letters,
 * memos, and official documents. Supports status management, user assignments,
 * and workflow tracking with search highlighting capabilities.
 * 
 * Features:
 * - Letter status tracking (Open, Closed, Processing, Signed, Sent)
 * - User assignment with avatar display
 * - Document linking and memo management
 * - Search highlighting across text fields
 * - Workflow checkboxes (Reply, Forward status)
 * - Action taken tracking with inline editing
 * - Role-based access control
 * 
 * @component
 * @example
 * ```jsx
 * <LettersTable
 *   allData={letters}
 *   setData={setLetters}
 *   users={allUsers}
 *   loading={false}
 *   handleClickOpen={handleModalOpen}
 *   openModal={setModalOpen}
 *   setCurrentRow={setSelectedRow}
 *   search={searchTerm}
 * />
 * ```
 */

import React from 'react';
import { GlobalStyles } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { LettersTableCore, Loader } from './components';
import { useLettersTable } from './hooks';
import { LETTERS_CONFIG } from './config';

const LettersTable = ({
  allData,
  setData,
  users,
  loading,
  handleClickOpen,
  openModal,
  setCurrentRow,
  search
}) => {
  const theme = useTheme();
  
  const {
    columns,
    handleChange,
    handleDelete,
    highlightText,
    getStatusColor
  } = useLettersTable({
    allData,
    setData,
    users,
    openModal,
    search,
    theme
  });

  return (
    <div>
      {loading && <Loader />}
      
      <GlobalStyles
        styles={{
          '& .cgTKyH': {
            backgroundColor: 'transparent !important',
            color: theme.palette.text.primary
          },
        }}
      />
      
      <LettersTableCore
        columns={columns}
        data={allData}
        loading={loading}
        theme={theme}
        config={LETTERS_CONFIG.table}
      />
    </div>
  );
};

export default LettersTable;
