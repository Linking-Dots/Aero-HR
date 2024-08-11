import {
    Avatar,
    Box,
    Button, CardContent, CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid, IconButton,
    InputLabel,
    MenuItem, Modal,
    Select,
    TextField
} from "@mui/material";
import React from "react";
import GlassCard from "@/Components/GlassCard.jsx";
import ClearIcon from '@mui/icons-material/Clear';
import Grow from "@mui/material/Grow";

const ProfileModal = ({user, open, closeModal }) => {
    return (
        <Modal
            open={open}
            onClose={closeModal}
            closeAfterTransition
            aria-labelledby="profile-modal-title"
            aria-describedby="profile-modal-description"
            sx={{
                p: 4,
            }}
        >
            <Grow in={open} timeout={500}>

                    <GlassCard>
                        <CardHeader
                            title={'Profile Information'}
                            sx={{padding: '24px'}}
                            action={
                                <IconButton
                                    variant="outlined"
                                    color="primary"
                                    onClick={closeModal}
                                    sx={{ position: 'absolute', top: 16, right: 16 }}
                                >
                                    <ClearIcon />
                                </IconButton>
                            }
                        />
                        <CardContent>
                            <form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} display="flex" alignItems="center">
                                        <div className="profile-img-wrap edit-img">
                                            <img className="inline-block" src={`assets/images/users/${user.user_name}.jpg`}
                                                 alt={user.name}/>

                                            <div className="fileupload btn">
                                                <span className="btn-text">edit</span>
                                                <input className="upload" type="file"/>
                                            </div>
                                        </div>
                                    </Grid>
                                    <Grid item xs={12} md={12}>
                                        <TextField
                                            label="Name"
                                            defaultValue="John"
                                            fullWidth
                                            margin="normal"
                                            value={user.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Birth Date"
                                            type="date"
                                            defaultValue="1985-06-05"
                                            fullWidth
                                            margin="normal"
                                            InputLabelProps={{shrink: true}}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Gender</InputLabel>
                                            <Select
                                                defaultValue="male"
                                                fullWidth
                                            >
                                                <MenuItem value="male">Male</MenuItem>
                                                <MenuItem value="female">Female</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Address"
                                            defaultValue="4487 Snowbird Lane"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="State"
                                            defaultValue="New York"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Country"
                                            defaultValue="United States"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Pin Code"
                                            defaultValue="10523"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Phone Number"
                                            defaultValue="631-889-3206"
                                            fullWidth
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                defaultValue=""
                                                fullWidth
                                            >
                                                <MenuItem value="">Select Department</MenuItem>
                                                <MenuItem value="Web Development">Web Development</MenuItem>
                                                <MenuItem value="IT Management">IT Management</MenuItem>
                                                <MenuItem value="Marketing">Marketing</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Designation</InputLabel>
                                            <Select
                                                defaultValue=""
                                                fullWidth
                                            >
                                                <MenuItem value="">Select Designation</MenuItem>
                                                <MenuItem value="Web Designer">Web Designer</MenuItem>
                                                <MenuItem value="Web Developer">Web Developer</MenuItem>
                                                <MenuItem value="Android Developer">Android Developer</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Reports To</InputLabel>
                                            <Select
                                                defaultValue=""
                                                fullWidth
                                            >
                                                <MenuItem value="">-</MenuItem>
                                                <MenuItem value="Wilmer Deluna">Wilmer Deluna</MenuItem>
                                                <MenuItem value="Lesley Grauer">Lesley Grauer</MenuItem>
                                                <MenuItem value="Jeffery Lalor">Jeffery Lalor</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                        <DialogActions>
                            <Button onClick={closeModal} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={closeModal} color="primary">
                                Submit
                            </Button>
                        </DialogActions>
                    </GlassCard>

            </Grow>
        </Modal>



    );
};

export default ProfileModal;
