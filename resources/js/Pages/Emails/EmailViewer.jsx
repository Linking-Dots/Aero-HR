import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Reply as ReplyIcon,
  ReplyAll as ReplyAllIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Report as ReportIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
  Label as LabelIcon,
  ArrowBack as ArrowBackIcon,
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useEmail } from '../../contexts/EmailContext';
import { sanitize } from 'dompurify';

const EmailViewer = ({ email, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailContent, setEmailContent] = useState(null);
  const emailBodyRef = useRef(null);
  const { markAsRead, deleteEmails } = useEmail();

  useEffect(() => {
    if (email && !email.read) {
      markAsRead.mutate(email.id);
    }
    
    // Simulate loading email content
    if (email) {
      setIsLoading(true);
      // In a real app, you would fetch the full email content here
      const timer = setTimeout(() => {
        setEmailContent(email.body || 'No content available');
        setIsLoading(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [email, markAsRead]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    deleteEmails.mutate([email.id]);
    onClose();
    handleMenuClose();
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatEmailAddress = (emailObj) => {
    return emailObj.name ? `"${emailObj.name}" <${emailObj.email}>` : emailObj.email;
  };

  if (!email) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isMobile ? '100%' : 'calc(100% - 400px)',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        right: 0,
        bgcolor: 'background.paper',
        zIndex: isMobile ? 1300 : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        {isMobile && (
          <IconButton onClick={onClose} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" noWrap>
            {email.subject || '(No subject)'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {format(parseISO(email.date), 'PPpp')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Tooltip title="Reply">
            <IconButton>
              <ReplyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          {isMobile && (
            <Tooltip title="Close">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Sender and Recipients */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              mr: 2,
              fontSize: '0.875rem',
            }}
          >
            {getInitials(email.from?.name || email.from?.email)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 'medium' }}>
                {email.from?.name || email.from?.email}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {email.from?.email}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              to me
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Email Body */}
      <Box
        ref={emailBodyRef}
        sx={{
          flex: 1,
          p: 3,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.primary.main, 0.1),
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '3px',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            className="email-content"
            dangerouslySetInnerHTML={{ 
              __html: sanitize(emailContent || 'No content available', {
                ALLOWED_TAGS: ['p', 'div', 'span', 'a', 'br', 'b', 'i', 'u', 'em', 'strong', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'style', 'class'],
              })
            }}
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              wordBreak: 'break-word',
              lineHeight: 1.6,
            }}
          />
        )}
      </Box>

      {/* Attachments */}
      {email.attachments?.length > 0 && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" gutterBottom>
            Attachments ({email.attachments.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {email.attachments.map((attachment, index) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: 300,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
              >
                <FileDownloadIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap variant="body2">
                    {attachment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(attachment.size / 1024).toFixed(1)} KB
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ReplyIcon />}
          onClick={() => {}}
        >
          Reply
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ReplyAllIcon />}
          onClick={() => {}}
        >
          Reply All
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ForwardIcon />}
          onClick={() => {}}
        >
          Forward
        </Button>
      </Box>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>Delete</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ReportIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Report Spam</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Snooze</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <LabelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Label</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EmailViewer;
