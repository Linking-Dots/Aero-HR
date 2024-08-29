import React from 'react';
import {Avatar, Box, CardContent, CardHeader, Divider, Grid, Typography} from '@mui/material';
import Grow from '@mui/material/Grow';
import GlassCard from "@/Components/GlassCard.jsx";

const UpdateSection = ({props, title, items }) => (
    <GlassCard>
        <CardHeader title={title} />
        {items.map((item, index) => (
            <React.Fragment key={index}>
                <Grow in>
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
                </Grow>
                {index < items.length - 1 && <Divider />}
            </React.Fragment>
        ))}
    </GlassCard>


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
        <Box sx={{ p: 2}}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Today" props={props} items={todayItems} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Tomorrow" props={props} items={tomorrowItems} />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <UpdateSection title="Next seven days" props={props} items={nextSevenDaysItems} />
                    </Box>
                </Grid>
            </Grid>
        </Box>

    );
};

export default UpdatesCards;
