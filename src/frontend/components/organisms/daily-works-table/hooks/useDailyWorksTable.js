/**
 * Daily Works Table Custom Hook
 * 
 * Manages state, API calls, and business logic for the DailyWorksTable organism.
 * Handles status updates, assignments, document capture, and file uploads.
 */

import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';

import { 
  StatusSelector, 
  AssignmentSelector, 
  RfiNumberCell, 
  TextCell, 
  ActionsCell 
} from '../components';
import { DAILY_WORKS_CONFIG, getStatusColor } from '../config';

export const useDailyWorksTable = ({ allData, setData, juniors, theme }) => {
  const { auth } = usePage().props;
  
  const userIsAdmin = auth.roles.includes('Administrator');
  const userIsSe = auth.roles.includes('Supervision Engineer');

  // Document capture functionality
  const captureDocument = async (taskNumber) => {
    try {
      // Create a new PDF document
      const pdf = new jsPDF();
      
      // Add content to PDF
      pdf.text(`Daily Work Report - ${taskNumber}`, 20, 20);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
      pdf.text(`Task Number: ${taskNumber}`, 20, 60);
      
      // Convert to blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error('Error capturing document:', error);
      toast.error('Failed to capture document', {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
      return null;
    }
  };

  // File upload functionality
  const uploadImage = async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId);

      const response = await axios.post('/api/daily-works/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('File uploaded successfully', {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file', {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
    }
  };

  // Handle field changes
  const handleChange = async (taskId, taskNumber, key, value, type) => {
    try {
      if (key === 'status' && value === 'completed' && !(type === 'Structure')) {
        const pdfFile = await captureDocument(taskNumber);
        if (pdfFile) {
          await uploadImage(taskId, pdfFile);
        }
      }

      const response = await axios.post(route('dailyWorks.update'), {
        id: taskId,
        [key]: value,
      });

      if (response.status === 200) {
        setData(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, [key]: value } : task
          )
        );

        toast.success(response.data.messages || 'Task updated successfully', {
          style: {
            backdropFilter: 'blur(16px) saturate(200%)',
            background: theme.glassCard.background,
            border: theme.glassCard.border,
            color: theme.palette.text.primary,
          }
        });
      } else {
        throw new Error(response.data.error || `Failed to update task ${key}.`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An unexpected error occurred.', {
        style: {
          backdropFilter: 'blur(16px) saturate(200%)',
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          color: theme.palette.text.primary,
        }
      });
    }
  };

  // Define table columns
  const columns = useMemo(() => {
    const baseColumns = [
      {
        name: 'Date',
        selector: row => row.date,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.date.width
      },
      {
        name: 'RFI NO',
        selector: row => row.number,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.rfiNumber.width,
        cell: row => (
          <RfiNumberCell 
            row={row}
            onDocumentCapture={captureDocument}
            onImageUpload={uploadImage}
          />
        ),
      },
      {
        name: 'Status',
        selector: row => row.status,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.status.width,
        style: { padding: '0px 10px 0px 10px' },
        cell: row => (
          <StatusSelector
            value={row.status}
            onChange={handleChange}
            rowId={row.id}
            rowNumber={row.number}
            rowType={row.type}
          />
        ),
      }
    ];

    // Add assignment column for supervision engineers
    if (userIsSe) {
      baseColumns.push({
        name: 'Assigned',
        selector: row => row.assigned,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.assigned.width,
        cell: row => (
          <AssignmentSelector
            value={row.assigned}
            onChange={handleChange}
            rowId={row.id}
            rowNumber={row.number}
            juniors={juniors}
          />
        ),
      });
    }

    // Add remaining columns
    baseColumns.push(
      {
        name: 'Type',
        selector: row => row.type,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.type.width,
      },
      {
        name: 'Description',
        selector: row => row.description,
        sortable: true,
        left: true,
        width: DAILY_WORKS_CONFIG.columns.description.width,
        cell: row => (
          <TextCell content={row.description} />
        ),
      },
      {
        name: 'Location',
        selector: row => row.location,
        sortable: true,
        center: true,
        width: DAILY_WORKS_CONFIG.columns.location.width,
        cell: row => (
          <TextCell content={row.location} />
        ),
      }
    );

    return baseColumns;
  }, [userIsSe, juniors, theme]);

  return {
    columns,
    handleChange,
    captureDocument,
    uploadImage,
    getStatusColor,
    userIsAdmin,
    userIsSe
  };
};
