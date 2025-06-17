/**
 * Status Selector Component
 * 
 * A specialized dropdown for selecting and updating daily work status.
 * Includes visual indicators, icons, and proper accessibility support.
 */

import React from 'react';
import { Select, SelectItem } from '@heroui/react';
import { 
  FiberNew as NewIcon,
  Replay as ResubmissionIcon,
  CheckCircle as CompletedIcon,
  Error as EmergencyIcon
} from '@mui/icons-material';

import { DAILY_WORKS_STATUS, getStatusColor } from '../config';

const StatusSelector = ({ 
  value, 
  onChange, 
  rowId, 
  rowNumber, 
  rowType,
  disabled = false 
}) => {
  const allStatuses = [
    { ...DAILY_WORKS_STATUS.NEW, icon: <NewIcon /> },
    { ...DAILY_WORKS_STATUS.RESUBMISSION, icon: <ResubmissionIcon /> },
    { ...DAILY_WORKS_STATUS.COMPLETED, icon: <CompletedIcon /> },
    { ...DAILY_WORKS_STATUS.EMERGENCY, icon: <EmergencyIcon /> }
  ];

  const handleStatusChange = (selectedValue) => {
    onChange(rowId, rowNumber, 'status', selectedValue, rowType);
  };

  return (
    <Select
      items={allStatuses}
      aria-label="Status"
      fullWidth
      value={value || 'na'}
      onChange={(e) => handleStatusChange(e.target.value)}
      selectedKeys={[String(value)]}
      style={{
        minWidth: '220px',
      }}
      color={getStatusColor(value)}
      popoverProps={{
        classNames: {
          content: 'bg-transparent backdrop-blur-lg border-inherit',
        },
        style: {
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
        },
      }}
      placeholder="Select Status"
      isDisabled={disabled}
      renderValue={(selectedStatuses) => {
        return selectedStatuses.map((selectedStatus) => (
          <div key={selectedStatus.key} className="flex items-center gap-2 m-1">
            {allStatuses.find(status => status.value === selectedStatus.data.value)?.icon}
            <span>
              {selectedStatus.data.label}
            </span>
          </div>
        ));
      }}
    >
      {(status) => (
        <SelectItem key={status.value} textValue={status.value}>
          <div className="flex items-center gap-2">
            {status.icon}
            <span style={{ color: getStatusColor(status.value) }}>
              {status.label}
            </span>
          </div>
        </SelectItem>
      )}
    </Select>
  );
};

export default StatusSelector;
