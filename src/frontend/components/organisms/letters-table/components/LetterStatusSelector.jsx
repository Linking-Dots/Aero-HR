/**
 * Letter Status Selector Component
 * 
 * A dropdown for selecting and updating letter status with proper color coding.
 */

import React from 'react';
import { Select, SelectItem } from '@heroui/react';
import { LETTER_STATUS, getStatusColor } from '../config';

const LetterStatusSelector = ({ 
  value, 
  onChange, 
  rowId,
  type = 'status', // 'status' or 'handling_status'
  disabled = false 
}) => {
  const statusOptions = type === 'handling_status' 
    ? [LETTER_STATUS.PROCESSING, LETTER_STATUS.SIGNED, LETTER_STATUS.SENT]
    : [LETTER_STATUS.OPEN, LETTER_STATUS.CLOSED];

  const handleStatusChange = (selectedValue) => {
    onChange(rowId, type, selectedValue);
  };

  return (
    <Select
      aria-label={type === 'handling_status' ? 'Handling Status' : 'Status'}
      color={getStatusColor(value)}
      placeholder="Select Status"
      value={value}
      onChange={(e) => handleStatusChange(e.target.value)}
      fullWidth
      selectedKeys={[value]}
      popoverProps={{
        classNames: {
          content: "bg-transparent backdrop-blur-lg border-inherit",
        },
      }}
      isDisabled={disabled}
    >
      {statusOptions.map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LetterStatusSelector;
