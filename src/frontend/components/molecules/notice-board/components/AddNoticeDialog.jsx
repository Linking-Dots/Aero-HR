/**
 * Add Notice Dialog Component
 * 
 * Dialog component for adding new notices.
 */

import React from 'react';
import { 
  Dialog, 
  Box, 
  Typography, 
  TextField, 
  Button,
  DialogContent,
  DialogActions 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const AddNoticeDialog = ({
  open,
  newNotice,
  onClose,
  onInputChange,
  onSubmit,
  isFormValid,
  config
}) => {
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth={config.ui.dialogMaxWidth}
      PaperProps={{
        sx: {
          backdropFilter: theme.glassCard.backdropFilter,
          background: theme.glassCard.background,
          border: theme.glassCard.border,
          borderRadius: 3
        }
      }}
      aria-labelledby="add-notice-dialog-title"
      aria-describedby="add-notice-dialog-description"
    >
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ p: 3 }}
      >
        <Typography 
          id="add-notice-dialog-title"
          variant="h6" 
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, mb: 3 }}
        >
          {config.labels.dialogTitle}
        </Typography>
        
        <DialogContent sx={{ p: 0, mb: 3 }}>
          <TextField
            name="title"
            label={config.labels.titleField}
            fullWidth
            value={newNotice.title}
            onChange={onInputChange}
            margin={config.styling.inputMargin}
            required
            error={newNotice.title.length > 0 && newNotice.title.length < config.validation.title.minLength}
            helperText={
              newNotice.title.length > 0 && newNotice.title.length < config.validation.title.minLength
                ? config.errorMessages.titleTooShort
                : ''
            }
            inputProps={{
              maxLength: config.validation.title.maxLength,
              'aria-label': config.accessibility.titleInputLabel
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            name="description"
            label={config.labels.descriptionField}
            multiline
            rows={config.ui.inputRows}
            fullWidth
            value={newNotice.description}
            onChange={onInputChange}
            margin={config.styling.inputMargin}
            required
            error={newNotice.description.length > 0 && newNotice.description.length < config.validation.description.minLength}
            helperText={
              newNotice.description.length > 0 && newNotice.description.length < config.validation.description.minLength
                ? config.errorMessages.descriptionTooShort
                : `${newNotice.description.length}/${config.validation.description.maxLength}`
            }
            inputProps={{
              maxLength: config.validation.description.maxLength,
              'aria-label': config.accessibility.descriptionInputLabel
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 0, justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            onClick={onClose}
            color="inherit"
            sx={{ textTransform: 'none' }}
          >
            {config.labels.cancelButton}
          </Button>
          <Button 
            type="submit"
            variant={config.ui.buttonVariant} 
            color={config.styling.buttonColor}
            disabled={!isFormValid}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 80
            }}
          >
            {config.labels.submitButton}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
