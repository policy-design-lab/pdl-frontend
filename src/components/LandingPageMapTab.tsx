import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
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
            color1 = '#F1EEF6';
            color2 = '#BDC9E1';
            color3 = '#74A9CF';
            color4 = '#2B8CBE';
            color5 = '#045A8D';
            break;
        case 'Title II: Conservation':
            color1 = '#F0F9E8';
            color2 = '#BAE4BC';
            color3 = '#7BCCC4';
            color4 = '#43A2CA';
            color5 = '#0868AC';
            break;
        case 'Crop Insurance':
            color1 = '#FFFFD3';
            color2 = '#CCE8A9';
            color3 = '#75CD76';
            color4 = '#1A9940';
            color5 = '#006837';
            break;
        case 'Supplemental Nutrition Assistance Program (SNAP)':
            color1 = '#F9F9D3';
            color2 = '#F9D48B';
            color3 = '#F59020';
            color4 = '#D95F0E';
            color5 = '#993404';
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
    const [value, setValue] = React.useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="center" width="100%" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="scrollable" value={value} onChange={handleChange} centered>
                    <Box>
                        <Typography variant="inherit" className="allSmallCaps" sx={{ mt: 1 }}>
                            Map visualization
                        </Typography>
                        <Typography variant="h5" className="smallCaps">
                            <strong>Farm Bill Data</strong>
                        </Typography>
                    </Box>
                    <Tab label="All Programs" />
                    <Tab label="Title I: Commodities" />
                    <Tab label="Title II: Conservation" />
                    <Tab label="Crop Insurance" />
                    <Tab label="Supplemental Nutrition Assistance Program (SNAP)" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} title="All Programs" />
            <TabPanel value={value} index={1} title="All Programs" />
            <TabPanel value={value} index={2} title="Title I: Commodities" />
            <TabPanel value={value} index={3} title="Title II: Conservation" />
            <TabPanel value={value} index={4} title="Crop Insurance" />
            <TabPanel value={value} index={5} title="Supplemental Nutrition Assistance Program (SNAP)" />
        </Box>
    );
}
