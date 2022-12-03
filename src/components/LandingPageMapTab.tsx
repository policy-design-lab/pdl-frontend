import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import LandingPageMap from './LandingPageMap';
import AllProgramMap from './AllProgramMap';
import ColorLegend from './ColorLegend';

interface TabPanelProps {
    index: number;
    value: number;
    title: string;
}

function TabPanel(props: TabPanelProps) {
    const { value, index, title, ...other } = props;
    let color1 = '';
    let color2 = '';
    let color3 = '';
    let color4 = '';
    let color5 = '';

    switch (title) {
        case 'Title I: Commodities':
            color1 = '#F9F9D3';
            color2 = '#F9D48B';
            color3 = '#F59020';
            color4 = '#D95F0E';
            color5 = '#993404';
            break;
        case 'Title II: Conservation':
            color1 = '#F0F9E8';
            color2 = '#BAE4BC';
            color3 = '#7BCCC4';
            color4 = '#43A2CA';
            color5 = '#0868AC';
            break;
        case 'Crop Insurance':
            color1 = '#A1622F';
            color2 = '#DCC287';
            color3 = '#f5f5f5';
            color4 = '#89CBC1';
            color5 = '#2C8472';
            break;
        case 'Supplemental Nutrition Assistance Program (SNAP)':
            color1 = '#F1EEF6';
            color2 = '#BDC9E1';
            color3 = '#74A9CF';
            color4 = '#2B8CBE';
            color5 = '#045A8D';
            break;
        case 'All Programs':
            color1 = '#FFF9D8';
            color2 = '#E1F2C4';
            color3 = '#9FD9BA';
            color4 = '#1B9577';
            color5 = '#005A45';
            break;
    }

    return (
        <Box role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box
                    sx={{
                        width: '60%',
                        m: 'auto'
                    }}
                >
                    {title === 'All Programs' ? <AllProgramMap /> : <LandingPageMap programTitle={title} />}
                    <ColorLegend color1={color1} color2={color2} color3={color3} color4={color4} color5={color5} />
                </Box>
            )}
        </Box>
    );
}

export default function LandingPageMapTab(): JSX.Element {
    const [value, setValue] = React.useState(2);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', mt: 5 }}>
            <Box display="flex" justifyContent="center" width="100%" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="scrollable" value={value} onChange={handleChange} centered>
                    <Box>
                        <Typography variant="h5" className="smallCaps">
                            <strong>Farm Bill Data</strong>
                        </Typography>
                        <Typography variant="inherit" className="allSmallCaps" sx={{ mt: 1 }}>
                            Map visualization
                        </Typography>
                    </Box>
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <Tab label="All Programs" />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <Tab label="Title I: Commodities" />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <Tab label="Title II: Conservation" />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <Tab label="Crop Insurance" />
                    <Divider sx={{ mx: 1 }} orientation="vertical" variant="middle" flexItem />
                    <Tab label="Supplemental Nutrition Assistance Program (SNAP)" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} title="All Programs" />
            <TabPanel value={value} index={2} title="All Programs" />
            <TabPanel value={value} index={4} title="Title I: Commodities" />
            <TabPanel value={value} index={6} title="Title II: Conservation" />
            <TabPanel value={value} index={8} title="Crop Insurance" />
            <TabPanel value={value} index={10} title="Supplemental Nutrition Assistance Program (SNAP)" />
        </Box>
    );
}
