import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import {useTheme} from "@mui/material/styles";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const theme = useTheme();

    return (
        <Box component="footer" py={3} sx={{ backgroundColor: theme.glassCard.backgroundColor, color: theme.palette.text.primary }}>
            <Container maxWidth="lg">
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            &copy; {currentYear} Emam Hosen.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography
                            variant="body2"
                            align="right"
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                            Designed & Developed by Emam Hosen
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;
