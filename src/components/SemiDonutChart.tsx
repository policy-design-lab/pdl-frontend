import React from 'react';
import { PieChart, Pie, Tooltip, Label } from 'recharts';
import { Box } from '@mui/material';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: never) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};
export default function SemiDonutChart(): JSX.Element {
    const data01 = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 278 },
        { name: 'Group F', value: 189 }
    ];

    return (
        <Box>
            <PieChart width={1000} height={400}>
                <Pie
                    dataKey="value"
                    data={data01}
                    startAngle={180}
                    endAngle={0}
                    cx={500}
                    cy={400}
                    innerRadius={150}
                    outerRadius={300}
                    fill="#82ca9d"
                    labelLine={false}
                    label={renderCustomizedLabel}
                >
                    <Label value="test test" position="center" dy={-75} />
                    <Label value="test test" position="center" dy={-15} />
                </Pie>
                <Tooltip />
            </PieChart>
        </Box>
    );
}
