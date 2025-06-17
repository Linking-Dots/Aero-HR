/**
 * HolidayTableCell Component
 * 
 * Renders different types of cells for the holiday table including
 * title, formatted dates, and other holiday information.
 * 
 * @component
 * @param {Object} holiday - Holiday object
 * @param {string} columnKey - Column identifier
 */

import React from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

export const HolidayTableCell = ({ holiday, columnKey }) => {
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

  switch (columnKey) {
    case "title":
      return (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          <span className="font-medium text-foreground">{holiday.title}</span>
        </div>
      );

    case "from_date":
      return (
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-foreground">{formatDate(holiday.from_date)}</span>
            <span className="text-xs text-default-500">Start date</span>
          </div>
        </div>
      );

    case "to_date":
      const duration = getDaysDifference(holiday.from_date, holiday.to_date);
      const isMultiDay = holiday.from_date !== holiday.to_date;
      
      return (
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4 text-secondary" />
          <div className="flex flex-col">
            <span className="text-foreground">{formatDate(holiday.to_date)}</span>
            <div className="flex items-center gap-1 text-xs text-default-500">
              <ClockIcon className="w-3 h-3" />
              <span>
                {isMultiDay ? `${duration} days` : '1 day'}
              </span>
            </div>
          </div>
        </div>
      );

    default:
      return <span className="text-foreground">{holiday[columnKey]}</span>;
  }
};
