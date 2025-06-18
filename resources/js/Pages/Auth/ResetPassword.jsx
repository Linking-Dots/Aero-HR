import React, {useState} from 'react';
import {Head, Link} from '@inertiajs/react';
import {Box, Card, CardContent, Container, Grid, TextField, Typography} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import App from "@/Layouts/App.jsx";
import logo from "../../../../public/assets/images/logo.png";
import Grow from "@mui/material/Grow";
import GlassCard from "@/Components/GlassCard.jsx";

export default function ResetPassword({ status }) {
    const [data, setData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    const handleChange = (field, value) => {
        setData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.newPassword !== data.confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        setErrors({});
        setProcessing(true);

        // Replace with your own logic for making HTTP requests
        post(route('password.update'), {
            old_password: data.oldPassword,
            new_password: data.newPassword
        })
            .then(response => {
                // Handle success
                console.log('Password updated successfully');
            })
            .catch(error => {
                // Handle error
                console.error('Password update failed:', error);
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    return (
        <App>
            <Head title="Reset Password" />
            <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} textAlign="center">
                        <Link style={{alignItems: 'center', display: 'inline-flex'}} href={route('dashboard')} className="mt-3 d-inline-block auth-logo">
                            <img src={logo} alt="Logo" height="100"/>
                        </Link>
                        <Typography variant="h6" className="mt-3" color="text.secondary">Daily Task
                            Management</Typography>
                    </Grid>
                    <Grid item xs={12} md={8} lg={6} xl={5}>
                        <Grow in>
                            <GlassCard>
                                <CardContent>
                                    <Box textAlign="center">
                                        <Typography variant="h5" color="primary">Welcome Back!</Typography>
                                        <Typography variant="body2" color="text.secondary">Sign in to
                                            continue</Typography>
                                    </Box>
                                    <Box mt={4}>
                                        <form onSubmit={handleSubmit}>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Old password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="oldPassword"
                                                    name="oldPassword"
                                                    value={data.oldPassword}
                                                    onChange={(e) => handleChange('oldPassword', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.oldPassword}
                                                    helperText={errors.oldPassword}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="New password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="newPassword"
                                                    name="newPassword"
                                                    value={data.newPassword}
                                                    onChange={(e) => handleChange('newPassword', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.newPassword}
                                                    helperText={errors.newPassword}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Confirm password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    value={data.confirmPassword}
                                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.confirmPassword}
                                                    helperText={errors.confirmPassword}
                                                />
                                            </Box>
                                            <Box mt={4}>
                                                <LoadingButton
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    loading={processing}
                                                >
                                                    Update Password
                                                </LoadingButton>
                                            </Box>
                                        </form>
                                        <Box mt={3} textAlign="center">
                                            <Typography variant="body2">
                                                Don't have an account? <Link href="/register">Register</Link>
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </GlassCard>
                        </Grow>
                    </Grid>
                </Grid>
            </Box>
            <footer>
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with <i
                                className="mdi mdi-heart text-danger"></i>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </footer>
        </App>
    );
}
