import React from "react";
import { PieChart, Pie, Tooltip, Label, Cell } from "recharts";
import { Box } from "@mui/material";

const RADIAN = Math.PI / 180;

// eslint-disable-next-line
export default function SemiDonutChart({ data, label1, label2 }: any): JSX.Element {
    // eslint-disable-next-line
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };
    // eslint-disable-next-line
    const renderCustomizedLabel2 = ({ x, cx, y, name }: any) => {
        return (
            <text x={x} y={y} fill="#000000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
                {name}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div
                    style={{
                        backgroundColor: "#f5f5f5",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                        textAlign: "center"
                    }}
                >
                    <h2 style={{ margin: "0" }}>{payload[0].name} Payment:</h2>
                    <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                        {payload[0].value.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <Box display="flex" justifyContent="center">
            <PieChart width={1400} height={450}>
                <Pie
                    dataKey="value"
                    data={data}
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
                        id="mainSemiDonutLabel"
                        value={
                            Number(label1) >= 1000000000
                                ? `$${Number(Number(label1) / 1000000000.0).toLocaleString(undefined, {
                                      maximumFractionDigits: 2
                                  })}B`
                                : `$${Number(Number(label1) / 1000000.0).toLocaleString(undefined, {
                                      maximumFractionDigits: 2
                                  })}M`
                        }
                        position="center"
                        dy={-75}
                        style={{ textAnchor: "middle", fontSize: "200%", fill: "rgba(0, 0, 0, 0.87)" }}
                    />
                    <Label value={label2} position="center" dy={-15} />
                    {data.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                    ))}
                </Pie>
                <Pie
                    dataKey="value"
                    data={data}
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
                <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{
                        backgroundColor: "white",
                        borderStyle: "ridge",
                        outline: "none",
                        borderRadius: "10px"
                    }}
                />
            </PieChart>
        </Box>
    );
}
