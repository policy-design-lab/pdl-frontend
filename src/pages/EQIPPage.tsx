import Box from '@mui/material/Box';
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import NavBar from '../components/NavBar';
import Drawer from '../components/ProgramDrawer';
import AllProgramMap from '../components/AllProgramMap';
import HorizontalStackedBar from '../components/HorizontalStackedBar';
import SemiDonutChart from '../components/SemiDonutChart';

export default function EQIPPage(): JSX.Element {
    const defaultTheme = createTheme();

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ position: 'fixed', zIndex: 1400, width: '100%' }}>
                    <NavBar />
                </Box>
                <Drawer />
                <Box sx={{ pl: 50, pr: 20 }}>
                    <AllProgramMap />
                    <HorizontalStackedBar />
                    <SemiDonutChart />
                </Box>
            </Box>
        </ThemeProvider>
    );
}
