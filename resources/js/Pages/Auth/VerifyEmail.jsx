import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { TextField, InputAdornment, IconButton, Box, Grid, Typography, Card, CardContent, Checkbox, FormControlLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoadingButton from '@mui/lab/LoadingButton';
import logo from '../../../../public/assets/images/logo.png'; // Assuming you have a logo image in the specified path

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login'); // Use the appropriate route for login
    };

    return (
        <div className="auth-page-wrapper pt-5">
        </div>
    );
};

export default Login;
