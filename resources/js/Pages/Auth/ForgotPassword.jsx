import React from 'react';
import {Head, Link, useForm} from '@inertiajs/react';
import {Box, Card, CardContent, Container, Grid, TextField, Typography} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import logo from '../../../../public/assets/images/logo.png';
import App from "@/Layouts/App.jsx";
import Grow from '@mui/material/Grow';


export default function ForgotPassword({status}) {

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        otp: '',
        newPassword: ''
    });


    const handleChange = (field, value) => {
        setData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {

        e.preventDefault();
        console.log(errors);

        // Replace with your own logic for making HTTP requests
        post(route('password.email'), {
            email: data.email
        }).then(response => {
                // Handle success
                console.log('Password reset link sent to ',data.email);
            }).catch(error => {
                // Handle error
                console.error('Password update failed:', error);
            }).finally(() => {
                setProcessing(false);
            });

    };

    return (
        <App>
            <Head title="Forgot Password" />
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
                            <Card sx={{
                                backdropFilter: 'blur(16px) saturate(200%)',
                                backgroundColor: 'rgba(17, 25, 40, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.125)',
                                p: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                position: 'relative',
                                borderRadius: '20px',
                                minWidth: '0px',
                                wordWrap: 'break-word',
                                bg: mode('#ffffff', 'navy.800'),
                                boxShadow: mode(
                                    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
                                    'unset',
                                ),
                                backgroundClip: 'border-box',
                            }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <Typography variant="body2" color="text.secondary">Please enter your email</Typography>
                                    </Box>
                                    <Box mt={4}>
                                        <form onSubmit={handleSubmit}>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Email adrress"
                                                    variant="outlined"
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={data.email}
                                                    onChange={(e) => handleChange('email', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.email}
                                                    helperText={errors.email}
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
                                                    Reset Password
                                                </LoadingButton>
                                            </Box>
                                        </form>
                                    </Box>
                                </CardContent>
                            </Card>
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
