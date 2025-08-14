import React from 'react';
import { Typography } from '@mui/material';
import { InboxIcon } from '@heroicons/react/24/outline';

const NoDataMessage = ({ 
  message = 'No data available', 
  description = 'Try adjusting your search or filters',
  icon = null 
}) => {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-2">
        {icon || <InboxIcon className="w-12 h-12 mx-auto text-default-300" />}
      </div>
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
      {description && (
        <Typography variant="caption" color="textSecondary">
          {description}
        </Typography>
      )}
    </div>
  );
};

export default NoDataMessage;
