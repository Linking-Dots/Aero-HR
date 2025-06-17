/**
 * RFI Number Cell Component
 * 
 * Displays RFI numbers with appropriate status-based links and actions.
 * Handles file attachments and document capture functionality.
 */

import React from 'react';
import { Link } from '@heroui/react';
import { 
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Close as CloseIcon 
} from '@mui/icons-material';

const RfiNumberCell = ({ 
  row, 
  onDocumentCapture, 
  onImageUpload 
}) => {
  const handleDocumentAction = async (e) => {
    e.preventDefault();
    
    if (row.status === 'completed' && !row.file) {
      const pdfFile = await onDocumentCapture(row.number);
      if (pdfFile) {
        await onImageUpload(row.id, pdfFile);
      }
    }
  };

  const renderRfiNumber = () => {
    if (row.status === 'completed' && row.file) {
      return (
        <Link
          isExternal
          isBlock
          showAnchorIcon
          anchorIcon={<AssignmentTurnedInIcon />}
          href={row.file}
          color="success"
          size="sm"
        >
          {row.number}
        </Link>
      );
    } else if (row.status === 'completed' && !row.file) {
      return (
        <Link
          isBlock
          showAnchorIcon
          anchorIcon={<CloseIcon />}
          href="#"
          color="danger"
          size="sm"
          onClick={handleDocumentAction}
        >
          {row.number}
        </Link>
      );
    } else {
      return row.number;
    }
  };

  return (
    <>
      {renderRfiNumber()}
      {row.reports && row.reports.map(report => (
        <div key={report.ref_no}>
          <span>
            <i className="mdi mdi-circle-medium"></i> {report.ref_no}
          </span>
        </div>
      ))}
    </>
  );
};

export default RfiNumberCell;
