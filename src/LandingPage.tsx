import * as React from 'react';
import { CardMedia, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import forest from './images/forest.png';
import News from './components/News';
import Footer from './components/Footer';
import LandingDisplay from './components/LandingDisplay';
import LandingPageMap from './components/LandingPageMap';

export default function LandingPage() {
    return (
        <Box sx={{ width: '100%' }}>
            <NavBar />
            <div style={{ position: 'relative' }}>
                <CardMedia component="img" src={forest} sx={{ maxHeight: '500px' }} />
                <Typography
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '50%',
                        left: '10%'
                    }}
                >
                    In support of policy design efforts in the forthcoming 2023 Congressional Farm Bill reauthorization
                    process.
                </Typography>
            </div>
            <LandingPageMap programTitle="Title I: Commodities" />
            <LandingPageMap programTitle="Title II: Conservation" />
            <LandingPageMap programTitle="Crop Insurance" />
            <LandingPageMap programTitle="Supplemental Nutrition Assistance Program (SNAP)" />
            <LandingDisplay />
            <News />
            <Footer />
        </Box>
    );
}
