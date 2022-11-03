import * as React from 'react';
import { CardMedia, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import forest from './images/forest.png';
import News from './components/News';
import Footer from './components/Footer';
import LandingDisplay from './components/LandingDisplay';
import LandingPageMapTab from './components/LandingPageMapTab';

export default function LandingPage() {
    return (
        <Box sx={{ width: '100%' }}>
            <NavBar />
            <div style={{ position: 'relative' }}>
                <CardMedia component="img" src={forest} sx={{ maxHeight: '500px' }} />
                <Typography
                    variant="h4"
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '20%',
                        left: '10%'
                    }}
                >
                    Using Existing Public Data To
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        position: 'absolute',
                        top: '30%',
                        left: '10%',
                        color: 'warning.main'
                    }}
                >
                    Visualize Agricultural And
                </Typography>
                <Typography
                    variant="h4"
                    sx={{
                        position: 'absolute',
                        color: 'warning.main',
                        top: '40%',
                        left: '10%'
                    }}
                >
                    Conservation Policies
                </Typography>
                <Typography
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '50%',
                        left: '10%'
                    }}
                >
                    In support of policy design efforts in the forthcoming 2023 Congressional Farm Bill reauthorization
                    process
                </Typography>
            </div>
            <LandingPageMapTab />
            <LandingDisplay />
            <News />
            <Footer />
        </Box>
    );
}
