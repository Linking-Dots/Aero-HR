/**
 * LettersTable - Organism Component
 * 
 * @file index.jsx
 * @description Table component for displaying and managing letters/documents
 * @version 1.0.0
 * @author Glass ERP Development Team
 * @created 2025-06-18
 * 
 * @features
 * - Letters/documents listing with pagination
 * - Search and filtering capabilities
 * - Actions for view, edit, delete
 * - Status indicators and date formatting
 * - Glass morphism design
 * - Responsive table layout
 * 
 * @dependencies
 * - React 18+
 * - Material-UI
 * - Day.js for date formatting
 */

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

/**
 * LettersTable Component
 * 
 * @description Table for displaying letters and documents with management actions
 * @param {Object} props - Component props
 * @param {Array} props.data - Letters data array
 * @param {boolean} props.loading - Loading state
 * @param {number} props.totalRows - Total number of records
 * @param {number} props.currentPage - Current page number
 * @param {number} props.perPage - Records per page
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onPerPageChange - Per page change handler
 * @param {Function} props.onEdit - Edit action handler
 * @param {Function} props.onDelete - Delete action handler
 * @param {Function} props.onView - View action handler
 */
const LettersTable = ({
  data = [],
  loading = false,
  totalRows = 0,
  currentPage = 1,
  perPage = 30,
  onPageChange,
  onPerPageChange,
  onEdit,
  onDelete,
  onView,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);

  // Handle actions menu
  const handleActionsClick = (event, letter) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedLetter(letter);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedLetter(null);
  };

  // Get letter type icon
  const getLetterTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'email':
        return <EmailIcon fontSize="small" />;
      case 'document':
        return <DocumentIcon fontSize="small" />;
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      default:
        return <DocumentIcon fontSize="small" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sent':
        return 'success';
      case 'draft':
        return 'warning';
      case 'pending':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return dayjs(date).format('MMM DD, YYYY HH:mm');
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    onPageChange?.(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    onPerPageChange?.(newPerPage);
    onPageChange?.(1);
  };

  const tableColumns = [
    { id: 'type', label: 'Type', minWidth: 80 },
    { id: 'subject', label: 'Subject', minWidth: 200 },
    { id: 'recipient', label: 'Recipient', minWidth: 150 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'created_at', label: 'Date', minWidth: 150 },
    { id: 'actions', label: 'Actions', minWidth: 120, align: 'center' },
  ];

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="letters table">
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    fontWeight: 600,
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <DocumentIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="body1" color="text.secondary">
                      No letters found
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((letter, index) => (
                <TableRow
                  hover
                  key={letter.id || index}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                  onClick={() => onView?.(letter)}
                >
                  {/* Type */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {getLetterTypeIcon(letter.type)}
                      </Avatar>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {letter.type || 'Document'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Subject */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {letter.subject || 'No Subject'}
                    </Typography>
                    {letter.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {letter.description.length > 60 
                          ? `${letter.description.substring(0, 60)}...` 
                          : letter.description
                        }
                      </Typography>
                    )}
                  </TableCell>

                  {/* Recipient */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {letter.recipient?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {letter.recipient || 'Unknown'}
                        </Typography>
                        {letter.recipient_email && (
                          <Typography variant="caption" color="text.secondary">
                            {letter.recipient_email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={letter.status || 'Draft'}
                      color={getStatusColor(letter.status)}
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(letter.created_at)}
                    </Typography>
                    {letter.sent_at && letter.sent_at !== letter.created_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Sent: {formatDate(letter.sent_at)}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView?.(letter);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(letter);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionsClick(e, letter)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 20, 30, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={perPage}
        page={currentPage - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
        }}
      />

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onView?.(selectedLetter);
            handleActionsClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit?.(selectedLetter);
            handleActionsClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Letter</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete?.(selectedLetter);
            handleActionsClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Letter</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export { LettersTable };
export default LettersTable;
