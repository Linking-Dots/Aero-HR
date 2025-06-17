/**
 * GlassDialog Atom Component
 * 
 * A dialog component with glass morphism styling that enhances
 * Material-UI Dialog with consistent glass theme and draggable functionality.
 * 
 * Features:
 * - Glass morphism styling
 * - Draggable functionality (desktop)
 * - Mobile responsive behavior
 * - Backdrop blur effects
 * - Theme integration
 * - Accessibility support
 * 
 * @component
 * @example
 * ```jsx
 * <GlassDialog open={isOpen} onClose={handleClose}>
 *   <DialogTitle>Title</DialogTitle>
 *   <DialogContent>Content</DialogContent>
 *   <DialogActions>Actions</DialogActions>
 * </GlassDialog>
 * ```
 */

import React, { forwardRef } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { Dialog, Grow, Paper } from '@mui/material';
import Draggable from "react-draggable";

import { GLASS_DIALOG_CONFIG } from './config';

// Draggable Paper Component
const DraggablePaper = (props) => {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
};

const GlassDialog = forwardRef(({ 
  open, 
  onClose,
  children, 
  maxWidth = 'md',
  fullWidth = true,
  draggable = true,
  className = '',
  style = {},
  TransitionComponent = Grow,
  ...props 
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Determine if dialog should be draggable
  const shouldUseDraggable = draggable && !isMobile;
  
  const glassStyles = {
    backdropFilter: theme.glassCard.backdropFilter,
    background: theme.glassCard.background,
    border: theme.glassCard.border,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderRadius: GLASS_DIALOG_CONFIG.styling.borderRadius,
    boxShadow: theme.palette.mode === 'light' 
      ? GLASS_DIALOG_CONFIG.styling.lightBoxShadow
      : 'unset',
    backgroundClip: 'border-box',
    overflow: 'hidden',
    ...style
  };

  return (
    <Dialog
      ref={ref}
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={TransitionComponent}
      PaperComponent={shouldUseDraggable ? DraggablePaper : undefined}
      className={className}
      aria-labelledby={shouldUseDraggable ? "draggable-dialog-title" : undefined}
      PaperProps={{
        sx: glassStyles,
        ...props.PaperProps
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: GLASS_DIALOG_CONFIG.backdrop.blur,
            backgroundColor: GLASS_DIALOG_CONFIG.backdrop.color,
            ...props.BackdropProps?.sx
          }
        }
      }}
      {...props}
    >
      {children}
    </Dialog>
  );
});

GlassDialog.displayName = 'GlassDialog';

export default GlassDialog;
