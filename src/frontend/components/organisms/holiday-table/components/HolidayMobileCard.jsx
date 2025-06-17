/**
 * HolidayMobileCard Component
 * 
 * Mobile-optimized card component for displaying holiday information.
 * Provides compact layout with all essential holiday details and actions.
 * 
 * @component
 * @param {Object} holiday - Holiday object
 * @param {number} index - Holiday index in list
 * @param {Function} onEdit - Edit handler function
 * @param {Function} onDelete - Delete handler function
 */

import React from "react";
import {
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Divider
} from "@heroui/react";
import {
  CalendarDaysIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

export const HolidayMobileCard = ({ holiday, index, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDaysDifference = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = getDaysDifference(holiday.from_date, holiday.to_date);
  const isMultiDay = holiday.from_date !== holiday.to_date;

  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-lg">
      <CardBody className="p-4">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
              <span className="text-sm font-semibold text-foreground">
                {index + 1}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                <h3 className="font-semibold text-foreground text-lg">
                  {holiday.title}
                </h3>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <ClockIcon className="w-3 h-3 text-default-400" />
                <span className="text-xs text-default-500">
                  {isMultiDay ? `${duration} days` : '1 day'}
                </span>
              </div>
            </div>
          </div>
          
          <Dropdown
            classNames={{
              content: "bg-white/10 backdrop-blur-md border-white/20"
            }}
          >
            <DropdownTrigger>
              <Button 
                isIconOnly 
                size="sm" 
                variant="light"
                className="text-default-400"
                aria-label={`Actions for ${holiday.title}`}
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Holiday actions">
              <DropdownItem
                key="edit"
                startContent={<PencilIcon className="w-4 h-4" />}
                onPress={onEdit}
              >
                Edit Holiday
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<TrashIcon className="w-4 h-4" />}
                onPress={onDelete}
              >
                Delete Holiday
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <Divider className="my-3" />

        {/* Date Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="w-5 h-5 text-primary" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground">Start Date</span>
              <span className="text-default-500">{formatDate(holiday.from_date)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <CalendarDaysIcon className="w-5 h-5 text-secondary" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium text-foreground">End Date</span>
              <span className="text-default-500">{formatDate(holiday.to_date)}</span>
            </div>
          </div>
        </div>

        {/* Duration Chip */}
        <div className="flex justify-end mt-4">
          <Chip
            size="sm"
            variant="flat"
            color="primary"
            startContent={<ClockIcon className="w-3 h-3" />}
          >
            {isMultiDay ? `${duration} days` : 'Single day'}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};
