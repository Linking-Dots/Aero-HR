/**
 * Action Taken Editor Component
 * 
 * An inline editor for updating action taken on letters with auto-save on blur.
 */

import React, { useState } from 'react';
import { Textarea } from '@heroui/react';

const ActionTakenEditor = ({ 
  initialValue, 
  onChange, 
  rowId,
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(initialValue || '');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleBlur = () => {
    if (inputValue !== initialValue) {
      onChange(rowId, 'action_taken', inputValue);
    }
  };

  return (
    <Textarea
      variant="underlined"
      size="sm"
      radius="sm"
      maxRows={2}
      fullWidth
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      isDisabled={disabled}
      placeholder="Enter action taken..."
    />
  );
};

export default ActionTakenEditor;
