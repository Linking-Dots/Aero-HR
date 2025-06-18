import * as React from 'react';
import {forwardRef} from 'react';
import Dialog from '@mui/material/Dialog';
import Grow from "@mui/material/Grow";
import {useTheme} from "@mui/material/styles";
import Draggable from "react-draggable";
import {Paper, useMediaQuery} from "@mui/material";

const PaperComponent = (props) => {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
};

const GlassDialog = forwardRef(({ open, closeModal, children, ...props }, ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Dialog
            {...props}
            ref={ref}
            open={open}
            onClose={closeModal}
            maxWidth="md"
            TransitionComponent={Grow}
            PaperComponent={!isMobile ? PaperComponent : undefined}
            aria-labelledby="draggable-dialog-title"
            PaperProps={{
                sx: {
                    backdropFilter: theme.glassCard.backdropFilter,
                    background: theme.glassCard.background,
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
