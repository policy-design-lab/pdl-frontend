import React from "react";
import { Box, Typography } from "@mui/material";
import PolicyBarChart from "./PolicyBarChart";
import InfoTooltip from "./CountyCommodityMap/InfoTooltip";

interface PolicyComparisonSectionProps {
    currentData: any;
    proposedData: any;
    title?: string;
    subTitle?: string;
    tooltip?: string;
    enableScenarioSwitching?: boolean;
}

export default function PolicyComparisonSection({
    currentData,
    proposedData,
    title = "Policy Impact Comparison",
    subTitle,
    tooltip,
    enableScenarioSwitching = true
}: PolicyComparisonSectionProps): JSX.Element {
    const chartData = {
        current: currentData,
        proposed: proposedData
    };
    return (
        <Box>
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
                {tooltip && <InfoTooltip title={tooltip} />}
            </Typography>
            {subTitle && (
                <Box>
                    <Typography
                        sx={{
                            fontSize: "0.875rem",
                            color: "#2F7164",
                            fontWeight: "bold",
                            mb: 1,
                            textAlign: "center"
                        }}
                    >
                        {subTitle}
                    </Typography>
                </Box>
            )}

            <Typography
                sx={{
                    fontSize: "0.875rem",
                    color: "#666",
                    fontStyle: "italic",
                    mb: 1,
                    textAlign: "center"
                }}
            >
                {enableScenarioSwitching
                    ? "Click commodity checkboxes to filter view (at least one must be selected). Hover over bars for detailed breakdown. C = Current Policy, P = Proposed Policy."
                    : "Click commodity checkboxes to filter view (at least one must be selected). Hover over bars for detailed breakdown."}
            </Typography>
            <Box sx={{ width: "100%" }}>
                <PolicyBarChart
                    data={chartData}
                    width={undefined}
                    height={450}
                    margin={{ top: 50, right: 80, bottom: 40, left: 80 }}
                />
            </Box>
        </Box>
    );
}
