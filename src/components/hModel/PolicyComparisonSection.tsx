import React from "react";
import { Box, Typography } from "@mui/material";
import PolicyBarChart from "./PolicyBarChart";

interface PolicyComparisonSectionProps {
    currentData: any;
    proposedData: any;
    title?: string;
    description?: string;
}

export default function PolicyComparisonSection({
    currentData,
    proposedData,
    title = "Policy Impact Comparison"
}: PolicyComparisonSectionProps): JSX.Element {
    const chartData = {
        current: currentData,
        proposed: proposedData
    };
    return (
        <>
            <Typography
                sx={{
                    fontWeight: 600,
                    fontSize: "1.5rem",
                    color: "#2F7164",
                    mb: 1,
                    textAlign: "center"
                }}
            >
                {title}
            </Typography>
            <Typography
                sx={{
                    fontSize: "0.875rem",
                    color: "#666",
                    fontStyle: "italic",
                    mb: 1,
                    textAlign: "center"
                }}
            >
                Hover over any bar to see total payment amounts and detailed breakdown
            </Typography>
            <Box sx={{ width: "100%" }}>
                <PolicyBarChart
                    data={chartData}
                    width={undefined}
                    height={450}
                    margin={{ top: 50, right: 80, bottom: 40, left: 80 }}
                />
            </Box>
        </>
    );
}
