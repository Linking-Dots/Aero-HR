import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Link, Avatar } from '@mui/material';
import { mode } from '@chakra-ui/theme-tools';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";

const UpdateSection = ({props, title, items }) => (
    <section>
        <Typography variant="h4" gutterBottom>{title}</Typography>
        {items.map((item, index) => (
            <Link href="#" key={index} sx={{ textDecoration: 'none' }}>
                <Grow in>
                    <GlassCard>
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1" color="text.secondary">{item.text}</Typography>
                            </Box>
                            {item.images && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {item.images.map((src, idx) => (
                                        <Avatar key={idx} src={src} sx={{ width: 56, height: 56 }} />
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </GlassCard>
                </Grow>
            </Link>
        ))}
    </section>
);

const UpdatesCards = (props) => {
    const auth = { user: { user_name: 'richard' } }; // Example auth object

    const todayItems = [
        { text: 'Richard Miles is off sick today.', images: [`/assets/images/users/${auth.user.user_name}.jpg`] },
        { text: 'You are away today.', images: [`/assets/images/users/${auth.user.user_name}.jpg`] },
    ];

    const tomorrowItems = [
        {
            text: '2 people will be away tomorrow.',
            images: [
                `/assets/images/users/${auth.user.user_name}.jpg`,
                `/assets/images/users/${auth.user.user_name}.jpg`,
            ],
        },
    ];

    const nextSevenDaysItems = [
        {
            text: '2 people are going to be away.',
            images: [
                `/assets/images/users/${auth.user.user_name}.jpg`,
                `/assets/images/users/${auth.user.user_name}.jpg`,
            ],
        },
        { text: "It's Spring Bank Holiday on Monday." },
    ];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box sx={{ p: 2 }}>
                    <UpdateSection title="Today" props={props} items={todayItems} />
                    <UpdateSection title="Tomorrow" props={props} items={tomorrowItems} />
                    <UpdateSection title="Next seven days" props={props} items={nextSevenDaysItems} />
                </Box>
            </Grid>
        </Grid>
    );
};

export default UpdatesCards;
