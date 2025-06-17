/**
 * DailyWorksTable Organism
 * 
 * A comprehensive daily work management table with status tracking, assignments,
 * and document management capabilities. Supports role-based access control
 * and real-time status updates.
 * 
 * Features:
 * - Status management with visual indicators
 * - Assignment delegation for supervision engineers
 * - Document upload and management
 * - Mobile-responsive design
 * - Real-time updates with toast notifications
 * 
 * @component
 * @example
 * ```jsx
 * <DailyWorksTable
 *   allData={dailyWorks}
 *   setData={setDailyWorks}
 *   loading={false}
 *   allInCharges={inCharges}
 *   juniors={juniorEngineers}
 *   reports={reports}
 *   reports_with_daily_works={reportsWithDailyWorks}
 *   handleClickOpen={handleOpenModal}
 *   openModal={setModalOpen}
 *   setCurrentRow={setSelectedRow}
 *   filteredData={filteredDailyWorks}
 *   setFilteredData={setFilteredDailyWorks}
 * />
 * ```
 */

import React from 'react';
import { GlobalStyles, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { DailyWorksTableCore } from './components';
import { useDailyWorksTable } from './hooks';
import { DAILY_WORKS_CONFIG } from './config';

const DailyWorksTable = ({
  allData,
  setData,
  loading,
  handleClickOpen,
  allInCharges,
  reports,
  juniors,
  reports_with_daily_works,
  openModal,
  setCurrentRow,
  filteredData,
  setFilteredData
}) => {
  const theme = useTheme();
  
  const {
    columns,
    handleChange,
    captureDocument,
    uploadImage,
    getStatusColor
  } = useDailyWorksTable({
    allData,
    setData,
    juniors,
    theme
  });

  return (
    <div>
      <GlobalStyles
        styles={{
          '& .cgTKyH': {
            backgroundColor: 'transparent !important',
            color: theme.palette.text.primary
          },
        }}
      />
      
      <DailyWorksTableCore
        columns={columns}
        data={allData}
        loading={loading}
        theme={theme}
        config={DAILY_WORKS_CONFIG.table}
      />
    </div>
  );
};

export default DailyWorksTable;
