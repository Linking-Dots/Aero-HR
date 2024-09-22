import {Button, CircularProgress, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import GlassDialog from "@/Components/GlassDialog.jsx";
import React from "react";
import {toast} from "react-toastify";
import {useTheme} from "@mui/material/styles";


const DeleteDailyWorkForm = ({ open, handleClose, handleDelete }) => {
    const theme = useTheme();

    return(
        <GlassDialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Confirm Deletion"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this task? This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleDelete} color="error" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </GlassDialog>

    );
}


export default DeleteDailyWorkForm;
