import React from 'react';
import { PieChart, Pie, Tooltip, Label, Cell } from 'recharts';
import { Box } from '@mui/material';

const RADIAN = Math.PI / 180;

// eslint-disable-next-line
export default function SemiDonutChart({ data, label1, label2 }: any): JSX.Element {
    const data01 = data;
    // eslint-disable-next-line
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };
    // eslint-disable-next-line
    const renderCustomizedLabel2 = ({ x, cx, y, name }: any) => {
        return (
            <text x={x} y={y} fill="#000000" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {name}
            </text>
        );
    };

    return (
        <Box display="flex" justifyContent="center">
            <PieChart width={1400} height={450}>
                <Pie
                    dataKey="value"
                    data={data01}
                    startAngle={180}
                    endAngle={0}
                    cx={700}
                    cy={400}
                    innerRadius={165}
                    outerRadius={330}
                    fill="#82ca9d"
                    label={renderCustomizedLabel}
                >
                    <Label
                        value={`$${Number(label1).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        })}`}
                        position="center"
                        dy={-75}
                    />
                    <Label value={label2} position="center" dy={-15} />
                    {data.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                    ))}
                </Pie>
                <Pie
                    dataKey="value"
                    data={data01}
                    startAngle={180}
                    endAngle={0}
                    cx={700}
                    cy={400}
                    innerRadius={165}
                    outerRadius={330}
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
