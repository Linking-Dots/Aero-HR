/**
 * Workflow Checkbox Component
 * 
 * A checkbox component for workflow status tracking (reply, forward, etc.).
 */

import React from 'react';
import { Checkbox } from '@heroui/react';
import { getStatusColor } from '../config';

const WorkflowCheckbox = ({ 
  isSelected, 
  onChange, 
  rowId,
  field,
  letterStatus,
  disabled = false 
}) => {
  const handleChange = (checked) => {
    onChange(rowId, field, checked);
  };

  return (
    <Checkbox
      color={getStatusColor(letterStatus)}
      isSelected={isSelected}
      onChange={(checked) => handleChange(checked)}
      isDisabled={disabled}
      aria-label={`${field} checkbox`}
    />
  );
};

export default WorkflowCheckbox;
