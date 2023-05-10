import React from "react";
import HSBar from "react-horizontal-stacked-bar-chart";
import { Box, Typography } from "@mui/material";

export default function HorizontalStackedBar({
    title,
    color1,
    color2,
    color3,
    color4,
    color5,
    label1,
    label2,
    label3,
    label4,
    label5,
    label6
}: {
    title: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    label1: string;
    label2: string;
    label3: string;
    label4: string;
    label5: string;
    label6: string;
}): JSX.Element {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 560
            }}
        >
            <Box display="flex" justifyContent="center">
                <Typography variant="h5" sx={{ mb: 1 }}>
                    <strong>{title}</strong>
                </Typography>
            </Box>
            <HSBar
                height={10}
                data={[
                    { value: 20, color: color1 },
                    { value: 20, color: color2 },
                    { value: 20, color: color3 },
                    { value: 20, color: color4 },
                    { value: 20, color: color5 }
                ]}
            />
            <Box sx={{ mt: 2 }}>
                <HSBar
                    showValueUp
                    height={0}
                    data={[
                        { value: 18, description: label1 },
                        { value: 19, description: label2 },
                        { value: 19.5, description: label3 },
                        { value: 19, description: label4 },
                        { value: 21, description: label5 },
                        { value: 2, description: label6 }
                    ]}
                />
            </Box>
        </Box>
    );
}
