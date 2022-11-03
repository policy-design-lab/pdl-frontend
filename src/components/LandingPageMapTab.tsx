import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LandingPageMap from './LandingPageMap';

interface TabPanelProps {
    index: number;
    value: number;
    title: string;
}

function TabPanel(props: TabPanelProps) {
    const { value, index, title, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ width: '75%', m: 'auto' }}>
                    <LandingPageMap programTitle={title} />
                </Box>
            )}
        </div>
    );
}

export default function LandingPageMapTab() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} centered>
                    <Tab label="Title I: Commodities" />
                    <Tab label="Title II: Conservation" />
                    <Tab label="Crop Insurance" />
                    <Tab label="Supplemental Nutrition Assistance Program (SNAP)" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} title="Title I: Commodities" />
            <TabPanel value={value} index={1} title="Title II: Conservation" />
            <TabPanel value={value} index={2} title="Crop Insurance" />
            <TabPanel value={value} index={3} title="Supplemental Nutrition Assistance Program (SNAP)" />
        </Box>
    );
}
