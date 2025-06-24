import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  useTheme,
  Paper,
  ClickAwayListener,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  InsertEmoticon as InsertEmoticonIcon,
  InsertLink as InsertLinkIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatQuote as FormatQuoteIcon,
  Code as CodeIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useEmail } from '../../contexts/EmailContext';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

const EmailComposer = ({ onClose, replyTo, forwardEmail }) => {
  const theme = useTheme();
  const { sendEmail } = useEmail();
  const [isMinimized, setIsMinimized] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formatAnchorEl, setFormatAnchorEl] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [recipients, setRecipients] = useState({
    to: replyTo ? [replyTo.from] : [],
    cc: [],
    bcc: [],
  });
  const [activeRecipientField, setActiveRecipientField] = useState('to');
  const [currentRecipient, setCurrentRecipient] = useState('');
  const [emailContent, setEmailContent] = useState({
    subject: replyTo ? `Re: ${replyTo.subject || ''}` : '',
    body: '',
  });
  const [isSending, setIsSending] = useState(false);
  const editorRef = useRef(null);

  // Initialize with forwarded email content if available
  useEffect(() => {
    if (forwardEmail) {
      setEmailContent({
        subject: `Fwd: ${forwardEmail.subject || ''}`,
        body: `\n\n---------- Forwarded message ---------\nFrom: ${forwardEmail.from?.name || forwardEmail.from?.email}\nDate: ${new Date(forwardEmail.date).toLocaleString()}\nSubject: ${forwardEmail.subject || '(No subject)'}\n\n${forwardEmail.body || ''}`,
      });
    }
  }, [forwardEmail]);

  const handleSend = async () => {
    if (!emailContent.subject.trim() || !emailContent.body.trim()) {
      // Show error or validation
      return;
    }

    setIsSending(true);
    try {
      await sendEmail.mutateAsync({
        to: recipients.to.map(r => r.email),
        cc: recipients.cc.map(r => r.email),
        bcc: recipients.bcc.map(r => r.email),
        subject: emailContent.subject,
        body: emailContent.body,
        attachments: attachments.map(file => ({
          name: file.name,
          content: file.content,
          type: file.type,
        })),
      });
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      // Show error message
    } finally {
      setIsSending(false);
    }
  };

  const handleRecipientKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      e.preventDefault();
      addRecipient();
    }
  };

  const addRecipient = () => {
    if (!currentRecipient.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(currentRecipient);
    
    if (isEmail) {
      const newRecipient = {
        id: uuidv4(),
        email: currentRecipient.trim(),
        name: '',
      };

      setRecipients(prev => ({
        ...prev,
        [activeRecipientField]: [...prev[activeRecipientField], newRecipient],
      }));
      setCurrentRecipient('');
    }
  };

  const removeRecipient = (field, id) => {
    setRecipients(prev => ({
      ...prev,
      [field]: prev[field].filter(r => r.id !== id),
    }));
  };

  const onDrop = (acceptedFiles) => {
    const newAttachments = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      content: '', // Will be read as base64
    }));

    // Read files as base64
    newAttachments.forEach(attachment => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result.split(',')[1]; // Remove the data URL prefix
        setAttachments(prev =>
          prev.map(a =>
            a.id === attachment.id ? { ...a, content } : a
          )
        );
      };
      reader.readAsDataURL(attachment.file);
    });

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleFormatMenuOpen = (event) => {
    setFormatAnchorEl(event.currentTarget);
  };

  const handleFormatMenuClose = () => {
    setFormatAnchorEl(null);
  };

  const handleContentChange = (e) => {
    setEmailContent(prev => ({
      ...prev,
      body: e.target.innerHTML,
    }));
  };

  const renderRecipientChips = (field) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
      {recipients[field].map((recipient) => (
        <Chip
          key={recipient.id}
          label={recipient.email}
          onDelete={() => removeRecipient(field, recipient.id)}
          size="small"
          sx={{
            '& .MuiChip-deleteIcon': {
              color: 'inherit',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
              },
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <ClickAwayListener onClickAway={() => {}}>
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.paper',
          ...(isDragActive && {
            border: `2px dashed ${theme.palette.primary.main}`,
            bgcolor: 'action.hover',
          }),
        }}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        
        {/* Header */}
        <Box
          sx={{
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            New Message
          </Typography>
          <Box>
            <Tooltip title="Minimize">
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <ExpandMoreIcon
                  sx={{
                    transform: isMinimized ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton size="small" color="inherit" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Recipients */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    width: 60,
                    color: 'text.secondary',
                    flexShrink: 0,
                  }}
                >
                  To:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {renderRecipientChips('to')}
                  <input
                    type="email"
                    value={currentRecipient}
                    onChange={(e) => setCurrentRecipient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !currentRecipient && recipients.to.length > 0) {
                        // Remove last recipient on backspace if input is empty
                        const lastRecipient = recipients.to[recipients.to.length - 1];
                        removeRecipient('to', lastRecipient.id);
                      } else {
                        handleRecipientKeyDown(e);
                      }
                    }}
                    onFocus={() => setActiveRecipientField('to')}
                    placeholder={recipients.to.length === 0 ? 'Recipients' : ''}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      color: theme.palette.text.primary,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    width: 60,
                    color: 'text.secondary',
                    flexShrink: 0,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                  onClick={() => setActiveRecipientField('cc')}
                >
                  Cc:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {recipients.cc.length > 0 && renderRecipientChips('cc')}
                  {activeRecipientField === 'cc' && (
                    <input
                      type="email"
                      value={currentRecipient}
                      onChange={(e) => setCurrentRecipient(e.target.value)}
                      onKeyDown={handleRecipientKeyDown}
                      onFocus={() => setActiveRecipientField('cc')}
                      placeholder="Cc"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: theme.palette.text.primary,
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    width: 60,
                    color: 'text.secondary',
                    flexShrink: 0,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                  onClick={() => setActiveRecipientField('bcc')}
                >
                  Bcc:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  {recipients.bcc.length > 0 && renderRecipientChips('bcc')}
                  {activeRecipientField === 'bcc' && (
                    <input
                      type="email"
                      value={currentRecipient}
                      onChange={(e) => setCurrentRecipient(e.target.value)}
                      onKeyDown={handleRecipientKeyDown}
                      onFocus={() => setActiveRecipientField('bcc')}
                      placeholder="Bcc"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: theme.palette.text.primary,
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Subject */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                placeholder="Subject"
                variant="standard"
                value={emailContent.subject}
                onChange={(e) =>
                  setEmailContent(prev => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    p: 0,
                    fontSize: '1rem',
                    fontWeight: 500,
                  },
                }}
              />
            </Box>

            {/* Toolbar */}
            <Box
              sx={{
                p: 0.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              <Tooltip title="Formatting options">
                <IconButton
                  size="small"
                  onClick={handleFormatMenuOpen}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <FormatBoldIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Attach files">
                <IconButton
                  size="small"
                  component="label"
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => onDrop(Array.from(e.target.files))}
                  />
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Insert link">
                <IconButton size="small">
                  <InsertLinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Insert emoji">
                <IconButton size="small">
                  <InsertEmoticonIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Email Body */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, minHeight: 200 }}>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                dangerouslySetInnerHTML={{ __html: emailContent.body }}
                style={{
                  outline: 'none',
                  minHeight: '100%',
                  color: theme.palette.text.primary,
                  lineHeight: 1.6,
                }}
              />
            </Box>

            {/* Attachments */}
            {attachments.length > 0 && (
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Attachments ({attachments.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {attachments.map((file) => (
                    <Paper
                      key={file.id}
                      variant="outlined"
                      sx={{
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        maxWidth: 200,
                      }}
                    >
                      <Avatar
                        src={file.preview}
                        variant="rounded"
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 1,
                          bgcolor: 'background.default',
                        }}
                      >
                        {!file.preview && <InsertLinkIcon fontSize="small" />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          display="block"
                          noWrap
                          sx={{ fontWeight: 500 }}
                        >
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeAttachment(file.id)}
                        sx={{ ml: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}

            {/* Footer */}
            <Box
              sx={{
                p: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.default',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleSend}
                disabled={
                  isSending ||
                  !emailContent.subject.trim() ||
                  !emailContent.body.trim() ||
                  recipients.to.length === 0
                }
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
              <Box>
                <Tooltip title="More options">
                  <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </>
        )}

        {/* Formatting Menu */}
        <Menu
          anchorEl={formatAnchorEl}
          open={Boolean(formatAnchorEl)}
          onClose={handleFormatMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <MenuItem onClick={() => formatText('bold')}>
            <ListItemIcon>
              <FormatBoldIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bold</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘+B
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => formatText('italic')}>
            <ListItemIcon>
              <FormatItalicIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Italic</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘+I
            </Typography>
          </MenuItem>
          <MenuItem onClick={() => formatText('underline')}>
            <ListItemIcon>
              <FormatUnderlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Underline</ListItemText>
            <Typography variant="body2" color="text.secondary">
              ⌘+U
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => formatText('insertUnorderedList')}>
            <ListItemIcon>
              <FormatListBulletedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bulleted List</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => formatText('insertOrderedList')}>
            <ListItemIcon>
              <FormatListNumberedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Numbered List</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => formatText('formatBlock', '<blockquote>')}>
            <ListItemIcon>
              <FormatQuoteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Quote</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => formatText('formatBlock', '<pre>')}>
            <ListItemIcon>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Code Block</ListItemText>
          </MenuItem>
        </Menu>

        {/* More Options Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={() => {}}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Discard</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <ListItemIcon>
              <AccessTimeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Schedule send</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <ListItemIcon>
              <ImageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Insert photo</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </ClickAwayListener>
  );
};

export default EmailComposer;
