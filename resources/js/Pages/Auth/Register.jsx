import React, {useEffect} from 'react';
import {Head, Link, useForm} from '@inertiajs/react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import App from "@/Layouts/App.jsx";
import logo from "../../../../public/assets/images/logo.png";
import Grow from "@mui/material/Grow";

export default function Register(props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const togglePasswordVisibility = (id) => {
        const passwordField = document.getElementById(id);
        passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    };

    return (
        <App>
            <Head title="Register" />
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
                                bg: mode('#ffffff', 'navy.800')(props),
                                boxShadow: mode(
                                    '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
                                    'unset',
                                )(props),
                                backgroundClip: 'border-box',
                            }}>
                                <CardContent>
                                    <Box textAlign="center">
                                        <Typography variant="h5" color="primary" textAlign="center">Register</Typography>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">Access to our dashboard</Typography>
                                    </Box>
                                    <Box mt={4}>

                                        <form onSubmit={submit}>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Email"
                                                    variant="outlined"
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.email}
                                                    helperText={errors.email}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="password"
                                                    name="password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.password}
                                                    helperText={errors.password}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => togglePasswordVisibility('password')}
                                                                >
                                                                    {document.getElementById('password')?.type === 'password' ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            <Box mb={3}>
                                                <TextField
                                                    label="Repeat Password"
                                                    variant="outlined"
                                                    type="password"
                                                    id="repeat-password"
                                                    name="password_confirmation"
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    required
                                                    fullWidth
                                                    error={!!errors.password_confirmation}
                                                    helperText={errors.password_confirmation}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => togglePasswordVisibility('repeat-password')}
                                                                >
                                                                    {document.getElementById('repeat-password')?.type === 'password' ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Box>
                                            <Box mt={4}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    type="submit"
                                                    disabled={processing}
                                                >
                                                    Register
                                                </Button>
                                            </Box>
                                        </form>
                                        <Box mt={3} textAlign="center">
                                            <Typography variant="body2">
                                                Already have an account? <Link href="/login">Login</Link>
                                            </Typography>
                                        </Box>
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
