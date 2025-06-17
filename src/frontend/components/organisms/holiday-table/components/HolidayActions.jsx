/**
 * HolidayActions Component
 * 
 * Renders action buttons for holiday management including edit and delete operations.
 * 
 * @component
 * @param {Object} holiday - Holiday object
 * @param {Function} onEdit - Edit handler function
 * @param {Function} onDelete - Delete handler function
 */

import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export const HolidayActions = ({ holiday, onEdit, onDelete }) => {
  return (
    <div className="relative flex items-center gap-2 justify-center">
      <Tooltip content="Edit Holiday" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-default-400 hover:text-primary"
          onPress={onEdit}
          aria-label={`Edit holiday: ${holiday.title}`}
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
      </Tooltip>
      
      <Tooltip content="Delete Holiday" color="danger" placement="top">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="text-danger-400 hover:text-danger"
          onPress={onDelete}
          aria-label={`Delete holiday: ${holiday.title}`}
        >
          <TrashIcon className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  );
};
