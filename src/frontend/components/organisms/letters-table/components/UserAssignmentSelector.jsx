/**
 * User Assignment Selector Component
 * 
 * A user selector for assigning letters to specific users with avatar display.
 */

import React from 'react';
import { Select, SelectItem, User } from '@heroui/react';

const UserAssignmentSelector = ({ 
  value, 
  onChange, 
  rowId,
  users = [],
  disabled = false 
}) => {
  const handleUserChange = (selectedValue) => {
    onChange(rowId, 'dealt_by', selectedValue);
  };

  return (
    <Select
      items={users}
      variant="underlined"
      aria-label="Dealt By"
      fullWidth
      value={value || 'na'}
      onChange={(e) => handleUserChange(e.target.value)}
      selectedKeys={[String(value)]}
      style={{
        minWidth: '260px',
      }}
      popoverProps={{
        classNames: {
          content: "bg-transparent backdrop-blur-lg border-inherit",
        },
        style: {
          whiteSpace: 'nowrap',
          minWidth: 'fit-content',
        },
      }}
      placeholder="Select a user"
      isDisabled={disabled}
      renderValue={(selectedUsers) => {
        return selectedUsers.map((selectedUser) => (
          <div key={selectedUser.key} className="flex items-center gap-2 m-1">
            <User
              style={{
                whiteSpace: 'nowrap',
              }}
              size="sm"
              name={selectedUser.data.name}
              description={selectedUser.data.designation?.title}
              avatarProps={{
                radius: "sm",
                size: "sm",
                src: selectedUser.data.profile_image
              }}
            />
          </div>
        ));
      }}
    >
      {(user) => (
        <SelectItem key={user.id} textValue={user.id}>
          <User
            style={{
              whiteSpace: 'nowrap',
            }}
            size="sm"
            name={user.name}
            description={user.designation?.title}
            avatarProps={{
              radius: "sm",
              size: "sm",
              src: user.profile_image
            }}
          />
        </SelectItem>
      )}
    </Select>
  );
};

export default UserAssignmentSelector;
