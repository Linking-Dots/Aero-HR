import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Tooltip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LabelImportant as LabelImportantIcon,
  LabelImportantOutlined as LabelImportantOutlinedIcon,
  Schedule as ScheduleIcon,
  Mail as MailIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useEmail } from '../../contexts/EmailContext';

const EmailList = ({ emails, isLoading, onEmailClick, selectedEmail }) => {
  const theme = useTheme();
  const [checked, setChecked] = useState([]);
  const [starredEmails, setStarredEmails] = useState(new Set());
  const [importantEmails, setImportantEmails] = useState(new Set());

  const handleToggle = (emailId) => (event) => {
    event.stopPropagation();
    const currentIndex = checked.indexOf(emailId);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(emailId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleStarToggle = (emailId, event) => {
    event.stopPropagation();
    setStarredEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const handleImportantToggle = (emailId, event) => {
    event.stopPropagation();
    setImportantEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  };

  const formatEmailPreview = (content, maxLength = 100) => {
    if (!content) return '';
    const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textOnly.length > maxLength
      ? `${textOnly.substring(0, maxLength)}...`
      : textOnly;
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

  if (isLoading) {
    return (
      <Box sx={{ p: 2, width: '100%', maxWidth: 800, mx: 'auto' }}>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 40, height: 40, mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ width: '40%', height: 16, bgcolor: 'action.hover', borderRadius: 1 }} />
                  <Box sx={{ width: '20%', height: 16, bgcolor: 'action.hover', borderRadius: 1 }} />
                </Box>
                <Box sx={{ mt: 1, width: '80%', height: 14, bgcolor: 'action.hover', borderRadius: 1 }} />
                <Box sx={{ mt: 0.5, width: '60%', height: 14, bgcolor: 'action.hover', borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  if (emails.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        textAlign: 'center',
        p: 3
      }}>
        <MailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No emails found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search or check back later
        </Typography>
      </Box>
    );
  }

  return (
    <List 
      sx={{ 
        width: '100%', 
        maxWidth: 800, 
        bgcolor: 'background.paper',
        borderRight: `1px solid ${theme.palette.divider}`,
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
      {emails.map((email) => {
        const labelId = `checkbox-list-label-${email.id}`;
        const isSelected = selectedEmail?.id === email.id;
        const isStarred = starredEmails.has(email.id);
        const isImportant = importantEmails.has(email.id);
        const isUnread = !email.read;

        return (
          <ListItem
            key={email.id}
            disablePadding
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              '&:hover': {
                bgcolor: isSelected 
                  ? alpha(theme.palette.primary.main, 0.12) 
                  : theme.palette.action.hover,
              },
              transition: 'background-color 0.2s',
            }}
            onClick={() => onEmailClick(email)}
          >
            <ListItemButton
              role={undefined}
              dense
              sx={{
                py: 1.5,
                px: 2,
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <Checkbox
                  edge="start"
                  checked={checked.indexOf(email.id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                  onClick={handleToggle(email.id)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'transparent',
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleStarToggle(email.id, e)}
                  sx={{
                    color: isStarred ? theme.palette.warning.main : 'text.secondary',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: theme.palette.warning.main,
                    },
                  }}
                >
                  {isStarred ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleImportantToggle(email.id, e)}
                  sx={{
                    color: isImportant ? theme.palette.error.main : 'text.secondary',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  {isImportant ? <LabelImportantIcon /> : <LabelImportantOutlinedIcon />}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="subtitle2"
                      noWrap
                      sx={{
                        fontWeight: isUnread ? 'fontWeightBold' : 'fontWeightRegular',
                        color: isUnread ? 'text.primary' : 'text.secondary',
                        flex: 1,
                        minWidth: 0,
                        pr: 1,
                      }}
                    >
                      {email.from.name || email.from.email}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap',
                          ml: 1,
                        }}
                      >
                        {formatDistanceToNow(parseISO(email.date), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: isUnread ? 'fontWeightMedium' : 'fontWeightRegular',
                        color: isUnread ? 'text.primary' : 'text.secondary',
                        flex: 1,
                        minWidth: 0,
                        pr: 1,
                      }}
                    >
                      {email.subject || '(No subject)'}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.8125rem',
                    }}
                  >
                    {formatEmailPreview(email.preview || email.body)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {email.hasAttachments && (
                    <Tooltip title="Has attachments">
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <AttachmentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default EmailList;
