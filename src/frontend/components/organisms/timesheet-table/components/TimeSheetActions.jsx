/**
 * TimeSheetActions Component
 * 
 * Action buttons for timesheet operations including edit, delete,
 * and other management actions.
 * 
 * @component
 * @example
 * <TimeSheetActions
 *   attendance={attendance}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onView={handleView}
 * />
 */

import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Button } from "@heroui/react";
import { 
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { TIMESHEET_TABLE_CONFIG } from "../config";

const TimeSheetActions = ({
    attendance,
    onEdit,
    onDelete,
    onView,
    onPunchCorrection,
    userRole = 'employee',
    isLoading = false
}) => {
    const { permissions } = TIMESHEET_TABLE_CONFIG;
    const userPermissions = permissions[userRole] || permissions.employee;

    const handleEdit = () => {
        if (onEdit && userPermissions.edit) {
            onEdit(attendance);
        }
    };

    const handleDelete = () => {
        if (onDelete && userPermissions.delete) {
            onDelete(attendance);
        }
    };

    const handleView = () => {
        if (onView) {
            onView(attendance);
        }
    };

    const handlePunchCorrection = () => {
        if (onPunchCorrection && userPermissions.edit) {
            onPunchCorrection(attendance);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {/* View Details */}
            <Tooltip content="View Details">
                <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleView}
                    isDisabled={isLoading}
                    className="min-w-unit-8 w-unit-8 h-unit-8"
                >
                    <EyeIcon className="w-4 h-4" />
                </Button>
            </Tooltip>

            {/* Punch Correction - Only for admins and if there are incomplete punches */}
            {userPermissions.edit && (attendance.has_incomplete_punch || attendance.complete_punches < attendance.punch_count) && (
                <Tooltip content="Correct Punches">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="warning"
                        onPress={handlePunchCorrection}
                        isDisabled={isLoading}
                        className="min-w-unit-8 w-unit-8 h-unit-8"
                    >
                        <ClockIcon className="w-4 h-4" />
                    </Button>
                </Tooltip>
            )}

            {/* Edit */}
            {userPermissions.edit && (
                <Tooltip content="Edit Record">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={handleEdit}
                        isDisabled={isLoading}
                        className="min-w-unit-8 w-unit-8 h-unit-8"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                </Tooltip>
            )}

            {/* Delete */}
            {userPermissions.delete && (
                <Tooltip content="Delete Record" color="danger">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={handleDelete}
                        isDisabled={isLoading}
                        className="min-w-unit-8 w-unit-8 h-unit-8"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </Tooltip>
            )}
        </div>
    );
};

export default TimeSheetActions;
