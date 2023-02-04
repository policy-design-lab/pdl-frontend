import React from 'react';
import { PieChart, Pie, Tooltip, Label, Cell } from 'recharts';
import { Box } from '@mui/material';

const RADIAN = Math.PI / 180;

export default function SemiDonutChart({ data }: any): JSX.Element {
    const data01 = data;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const renderCustomizedLabel2 = ({ x, cx, y, name }: any) => {
        return (
            <text x={x} y={y} fill="#000000" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {name}
            </text>
        );
    };

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
                    label={renderCustomizedLabel}
                >
                    <Label value="test test" position="center" dy={-75} />
                    <Label value="test test" position="center" dy={-15} />
                    {data.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                    ))}
                </Pie>
                <Pie
                    dataKey="value"
                    data={data01}
                    startAngle={180}
                    endAngle={0}
                    cx={500}
                    cy={400}
                    innerRadius={150}
                    outerRadius={300}
                    nameKey="name"
                    label={renderCustomizedLabel2}
                >
                    {data.map((entry) => (
                        <Cell key={entry.id} fillOpacity={0} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </Box>
    );
}
