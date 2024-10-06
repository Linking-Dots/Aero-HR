import React, {useState} from 'react';
import {Head, Link, useForm} from '@inertiajs/react';
import {
    Box,
    CardContent,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import logo from '../../../../public/assets/images/logo.png';
import App from '@/Layouts/App.jsx'
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";
import {Input, Button, Checkbox} from '@nextui-org/react';
import EmailIcon from '@mui/icons-material/Email';
import {useTheme} from '@mui/material/styles';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PasswordIcon from '@mui/icons-material/Password';

const Login = () => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
        });
    };
    console.log(errors)


    return (
        <App>
            <Head title="Login"/>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                p: 2
            }}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={8} lg={6} xl={5}>
                        <Grow in>
                            <GlassCard>

                                <CardContent>
                                    <Box textAlign="center">
                                        <Link style={{
                                            alignItems: 'center',
                                            display: 'inline-flex',

                                        }} href={route('dashboard')} className="d-inline-block auth-logo">
                                            <img src={logo} alt="Logo" className="h-24 md:h-40 sm:h-40 xs:h-10"/>
                                        </Link>
                                        <Typography color="primary" sx={{ fontSize: { xs: '0.750rem', sm: '1.0rem', md: '1.25rem' } }}>Welcome Back!</Typography>
                                        <Typography color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}>Sign in to continue</Typography>
                                    </Box>
                                    <Box mt={4}>
                                        <form onSubmit={handleSubmit}>
                                            <Box mb={4}>
                                                <Input
                                                    isClearable
                                                    type="email"
                                                    label="Email"
                                                    variant="bordered"
                                                    id="email"
                                                    name="email"
                                                    value={data.email}
                                                    onChange={(e) => {
                                                        setData('email', e.target.value);
                                                    }}
                                                    onClear={() => setData('email', '')}
                                                    required
                                                    autoFocus
                                                    fullWidth
                                                    isInvalid={!!errors.email}
                                                    errorMessage={errors.email}
                                                    placeholder="you@example.com"
                                                    labelPlacement="outside"
                                                    startContent={
                                                        <EmailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                    }
                                                />
                                            </Box>
                                            <Box mb={4}>
                                                <Input
                                                    label="Password"
                                                    variant="bordered"
                                                    placeholder="Enter your password"
                                                    startContent={
                                                        <PasswordIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                                    }
                                                    endContent={
                                                        <button className="focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)} aria-label="toggle password visibility">
                                                            {showPassword ? (
                                                                <VisibilityOff className="text-2xl text-default-400 pointer-events-none" />
                                                            ) : (
                                                                <Visibility className="text-2xl text-default-400 pointer-events-none" />
                                                            )}
                                                        </button>
                                                    }
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    required
                                                    isInvalid={!!errors.password}
                                                    errorMessage={errors.password}
                                                    labelPlacement="outside"
                                                />
                                            </Box>

                                            <Box>
                                                <Button
                                                    fullWidth
                                                    variant="bordered"
                                                    type="submit"
                                                    color="primary"
                                                    isLoading={processing}>
                                                    Login
                                                </Button>
                                            </Box>
                                            <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
                                                <Link href={route('password.request')} className="text-sm mx-auto text-primary">
                                                    Forgot password?
                                                </Link>
                                            </Box>
                                        </form>
                                    </Box>
                                </CardContent>
                            </GlassCard>
                        </Grow>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{
                left: 0,
                right: 0,
                bottom: 10,
                position: 'fixed'
            }}>
                <Container>
                    <Grid container justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography sx={{ bottom: 0, display: 'flex', justifyContent: 'center'}} color="text.secondary">
                                &copy; {new Date().getFullYear()} Emam Hosen. Crafted with<FavoriteBorderIcon/>
                            </Typography>

                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </App>

    );
};

export default Login;
