/**
 * LeaveActions Component
 * 
 * Renders action buttons for leave management operations.
 * Provides edit and delete functionality with proper access controls.
 * 
 * @component
 * @example
 * <LeaveActions
 *   leave={leave}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */

import React from "react";
import { Box, Button, Tooltip } from "@heroui/react";
import { usePage } from "@inertiajs/react";
import { 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

const LeaveActions = ({
  leave,
  onEdit,
  onDelete
}) => {
  const { auth } = usePage().props;
  
  const userIsAdmin = auth.roles.includes("Administrator");
  const userIsSE = auth.roles.includes("Supervision Engineer");
  const isOwnLeave = auth.user.id === leave.employee_id;
  
  // Determine permissions
  const canEdit = userIsAdmin || userIsSE || (isOwnLeave && leave.status === 'New');
  const canDelete = userIsAdmin || userIsSE || (isOwnLeave && leave.status === 'New');

  if (!canEdit && !canDelete) {
    return (
      <Box className="flex items-center justify-center">
        <span className="text-xs text-default-400">No actions</span>
      </Box>
    );
  }

  return (
    <Box className="flex items-center justify-center gap-1">
      {canEdit && (
        <Tooltip 
          content="Edit leave request" 
          delay={500}
          closeDelay={100}
        >
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="primary"
            onPress={onEdit}
            className="w-7 h-7 min-w-7"
            aria-label={`Edit leave request for ${leave.leave_type}`}
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      )}
      
      {canDelete && (
        <Tooltip 
          content="Delete leave request" 
          delay={500}
          closeDelay={100}
          color="danger"
        >
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            onPress={onDelete}
            className="w-7 h-7 min-w-7"
            aria-label={`Delete leave request for ${leave.leave_type}`}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default LeaveActions;
