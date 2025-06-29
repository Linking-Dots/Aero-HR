import React, { forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import Fade from '@mui/material/Fade';

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade timeout={600} ref={ref} {...props} />;
});

const GlassDialog = forwardRef(({
  open,
  closeModal,
  children,
  ...props
}, ref) => {
  return (
    <Dialog
      {...props}
      ref={ref}
      open={open}
      onClose={closeModal}
      fullWidth
      maxWidth="md"
      variant="glass"                      // ✅ Enables glass theme variant
      TransitionComponent={Transition}     // ✅ Smooth Fade animation
      aria-labelledby="glass-dialog"
    >
      {children}
    </Dialog>
  );
});

GlassDialog.displayName = 'GlassDialog';

export default GlassDialog;
