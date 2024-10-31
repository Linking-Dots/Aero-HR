import React, {useEffect, useState} from 'react';
import {Head, useForm} from '@inertiajs/react';
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import App from "@/Layouts/App.jsx";

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'));
    };

    return (
        <App>
            <Head title="Confirm Password" />
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} textAlign="center">
                            <Typography variant="h5" color="primary">Confirm Password</Typography>
                            <Typography variant="body2" color="text.secondary" className="mb-4">
                                This is a secure area of the application. Please confirm your password before continuing.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <form onSubmit={submit}>
                                        <Box mb={3}>
                                            <TextField
                                                label="Password"
                                                variant="outlined"
                                                type={showPassword ? 'text' : 'password'}
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
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                onMouseDown={(e) => e.preventDefault()}
                                                                edge="end"
                                                            >
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                        <Box mt={4} display="flex" justifyContent="flex-end">
                                            <LoadingButton
                                                variant="contained"
                                                color="primary"
                                                type="submit"
                                                loading={processing}
                                            >
                                                Confirm
                                            </LoadingButton>
                                        </Box>
                                    </form>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </App>
    );
}
