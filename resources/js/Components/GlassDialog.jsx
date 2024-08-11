import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Grow from "@mui/material/Grow";
import { forwardRef } from "react";
import { useTheme } from "@mui/material/styles";

const GlassDialog = forwardRef(({ open, closeModal, children, ...props }, ref) => {
    const theme = useTheme();

    return (
        <Dialog
            {...props}
            ref={ref}
            open={open}
            onClose={closeModal}
            maxWidth="md"
            TransitionComponent={Grow}
            PaperProps={{
                sx: {
                    backdropFilter: 'blur(16px) saturate(200%)',
                    backgroundColor: theme.glassCard.backgroundColor,
                    border: theme.glassCard.border,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: '20px',
                    boxShadow: theme.palette.mode === 'light' ?
                        '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
                        : 'unset',
                    backgroundClip: 'border-box',
                }
            }}
        >
            {children}
        </Dialog>
    );
});

export default GlassDialog;
