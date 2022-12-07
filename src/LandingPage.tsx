import * as React from 'react';
import { CardMedia, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import NavBar from './components/NavBar';
import forest from './images/forest.png';
import News from './components/News';
import Footer from './components/Footer';
import LandingDisplay from './components/LandingDisplay';
import LandingPageMapTab from './components/LandingPageMapTab';

export default function LandingPage(): JSX.Element {
    return (
        <Box sx={{ width: '100%' }}>
            <NavBar />
            <div style={{ position: 'relative' }}>
                <CardMedia component="img" src={forest} sx={{ maxHeight: '650px' }} />
                <Typography
                    variant="h3"
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '30%',
                        left: '10%'
                    }}
                >
                    <strong>Visualizing Policy</strong>
                </Typography>
                <Typography
                    variant="h3"
                    sx={{
                        position: 'absolute',
                        top: '40%',
                        left: '10%',
                        color: 'white'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row'
                        }}
                    >
                        <Box>
                            <Typography variant="h3" sx={{ mr: 1 }}>
                                <strong>Design:</strong>
                            </Typography>
                        </Box>
                        <Box sx={{ color: '#FF8C22' }}>
                            <strong>The Farm Bill</strong>
                        </Box>
                    </Box>
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '50%',
                        left: '10%'
                    }}
                >
                    Using public data and computational resources to understand federal
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        position: 'absolute',
                        color: 'white',
                        top: '55%',
                        left: '10%'
                    }}
                >
                    agricultural, conservation and food policies
                </Typography>
            </div>
            <LandingPageMapTab />
            <LandingDisplay />
            <News />
            <Footer />
        </Box>
    );
}
