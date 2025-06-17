/**
 * Assignment Selector Component
 * 
 * A user selector for assigning daily work items to junior engineers.
 * Features user avatars, search capabilities, and proper role validation.
 */

import React from 'react';
import { Select, SelectItem, User } from '@heroui/react';
import { Box, Avatar } from '@mui/material';

const AssignmentSelector = ({ 
  value, 
  onChange, 
  rowId, 
  rowNumber,
  juniors = [],
  disabled = false 
}) => {
  const handleAssignmentChange = (selectedValue) => {
    onChange(rowId, rowNumber, 'assigned', selectedValue);
  };

  return (
    <Select
      items={juniors}
      variant="underlined"
      aria-label="Assigned"
      fullWidth
      size="small"
      value={value || 'na'}
      style={{
        minWidth: '260px',
      }}
      onChange={(e) => handleAssignmentChange(e.target.value)}
      popoverProps={{
        classNames: {
          content: 'bg-transparent backdrop-blur-lg border-inherit',
        },
        style: {
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
        },
      }}
      placeholder="Select a junior"
      selectedKeys={[String(value || '')]}
      isDisabled={disabled}
      renderValue={(selectedJuniors) => {
        return selectedJuniors.map((selectedJunior) => (
          <div key={selectedJunior.key} className="flex items-center gap-2 m-1">
            <User
              style={{
                whiteSpace: 'nowrap',
              }}
              size="sm"
              name={selectedJunior.data.name}
              avatarProps={{
                radius: "sm",
                size: "sm",
                src: selectedJunior.data.profile_image,
              }}
            />
          </div>
        ));
      }}
    >
      {(junior) => (
        <SelectItem key={junior.id} textValue={junior.id}>
          <Box sx={{ display: 'flex' }}>
            <Avatar
              src={junior.profile_image}
              alt={junior.name || 'Not assigned'}
              sx={{
                borderRadius: '50%',
                width: 23,
                height: 23,
                display: 'flex',
                marginRight: 1,
              }}
            />
            {junior.name}
          </Box>
        </SelectItem>
      )}
    </Select>
  );
};

export default AssignmentSelector;
