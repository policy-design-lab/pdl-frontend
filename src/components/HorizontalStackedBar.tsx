import React from 'react';
import HSBar from 'react-horizontal-stacked-bar-chart';
import { Box } from '@mui/material';

export default function HorizontalStackedBar(): JSX.Element {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <HSBar
                showValueUp
                height={0}
                data={[
                    { value: 10000, description: '(i) structure practices', color: '#2F7164' },
                    { value: 5000, description: '(ii) land management practices', color: '#4E867A' },
                    { value: 3000, description: '(iii) vegetative practices', color: '#78A39A' },
                    { value: 3000, description: '(iv) forest management', color: '#A1BFB9' },
                    { value: 3000, description: '(v) soil testing', color: '#C1D4D1' },
                    { value: 3000, description: '(vi) Soil Remediation', color: '#D5E3E0' },
                    { value: 3000, description: '(viii) other', color: '#F2F5F4' }
                ]}
            />
            <HSBar
                showValueIn
                height={80}
                data={[
                    { value: 10000, color: '#2F7164' },
                    { value: 5000, color: '#4E867A' },
                    { value: 3000, color: '#78A39A' },
                    { value: 3000, color: '#A1BFB9' },
                    { value: 3000, color: '#C1D4D1' },
                    { value: 3000, color: '#D5E3E0' },
                    { value: 3000, color: '#F2F5F4' }
                ]}
            />
        </Box>
    );
}
