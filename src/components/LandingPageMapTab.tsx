import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LandingPageMap from './LandingPageMap';
import AllProgramMap from './AllProgramMap';

interface TabPanelProps {
    index: number;
    value: number;
    title: string;
}

function TabPanel(props: TabPanelProps) {
    const { value, index, title, ...other } = props;

    return (
        <Box role="tabpanel" hidden={value !== index} {...other} sx={{ mt: 3 }}>
            {value === index && (
                <Box
                    sx={{
                        width: '85%',
                        m: 'auto',
                        borderRight: 40,
                        borderLeft: 40,
                        borderTop: 20,
                        borderBottom: 20,
                        borderColor: 'grey.200'
                    }}
                >
                    {title === 'All Programs' ? <AllProgramMap /> : <LandingPageMap programTitle={title} />}
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} centered>
                    <Tab label="All Programs" />
                    <Tab label="Title I: Commodities" />
                    <Tab label="Title II: Conservation" />
                    <Tab label="Crop Insurance" />
                    <Tab label="Supplemental Nutrition Assistance Program (SNAP)" />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0} title="All Programs" />
            <TabPanel value={value} index={1} title="Title I: Commodities" />
            <TabPanel value={value} index={2} title="Title II: Conservation" />
            <TabPanel value={value} index={3} title="Crop Insurance" />
            <TabPanel value={value} index={4} title="Supplemental Nutrition Assistance Program (SNAP)" />
        </Box>
    );
}
