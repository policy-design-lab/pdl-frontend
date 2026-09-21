import React from "react";
import { Box, Typography, TypographyProps } from "@mui/material";
import { formatCommoditySelection, formatYearDisplay } from "./titleUtils";

const highlightSx = {
    fontWeight: 700,
    backgroundColor: "rgba(47, 113, 100, 0.1)",
    padding: "0 4px",
    borderRadius: "4px"
};

interface SelectionTitleProps {
    metricLabel: string;
    selectedYears: string[];
    selectedCrops: string[];
    allCropsSentinel: string;
    allCropsLabel?: string;
    selectedState?: string;
    variant?: TypographyProps["variant"];
    noWrap?: boolean;
    sx?: TypographyProps["sx"];
}

const SelectionTitle = ({
    metricLabel,
    selectedYears,
    selectedCrops,
    allCropsSentinel,
    allCropsLabel = "All Commodities",
    selectedState = "All States",
    variant = "h6",
    noWrap = false,
    sx
}: SelectionTitleProps): JSX.Element => {
    const cropDisplay = formatCommoditySelection(selectedCrops, allCropsSentinel) || allCropsLabel;
    const yearDisplay = formatYearDisplay(selectedYears);
    const isAggregated = selectedYears.length > 1;
    return (
        <Typography variant={variant} noWrap={noWrap} sx={sx}>
            {metricLabel} for{" "}
            <Box component="span" sx={highlightSx}>
                {cropDisplay}
            </Box>{" "}
            (
            <Box component="span" sx={highlightSx}>
                {yearDisplay}
            </Box>
            ){isAggregated ? " - Aggregated" : ""}
            {selectedState !== "All States" && (
                <>
                    {" - "}
                    <Box component="span" sx={highlightSx}>
                        {selectedState}
                    </Box>
                </>
            )}
        </Typography>
    );
};

export default SelectionTitle;
