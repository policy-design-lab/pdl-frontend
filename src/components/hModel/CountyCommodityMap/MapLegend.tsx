import React from "react";
import { Box, Typography } from "@mui/material";
import * as d3 from "d3";
import DrawLegend from "../../shared/DrawLegend";

const MapLegend = ({
    mapData,
    mapColor,
    viewMode,
    selectedYear,
    selectedState,
    yearAggregation,
    showMeanValues,
    proposedPolicyName
}) => {
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);
    const getLegendTitle = () => {
        let title = "";
        if (viewMode === "difference") {
            title = `${
                showMeanValues ? "Mean Rate" : "Payment"
            } Differences Between Current and Proposed Policy for ${selectedYear}`;
        } else if (showMeanValues) {
            title = `Mean Payment Rates for ${selectedYear}`;
        } else {
            title = `Total Payments for ${selectedYear}`;
        }
        if (selectedState !== "All States") {
            title += ` in ${selectedState}`;
        }
        if (yearAggregation > 0 && !showMeanValues) {
            title += ` (Aggregated with previous ${yearAggregation} year${yearAggregation > 1 ? "s" : ""})`;
        }
        if (viewMode !== "difference") {
            title += viewMode === "current" ? " (Current Policy)" : ` (${proposedPolicyName})`;
        }
        return title;
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            <DrawLegend
                key={`${selectedYear}-${viewMode}-${showMeanValues}-${mapData.thresholds.join(
                    ","
                )}-${selectedState}-${yearAggregation}`}
                colorScale={colorScale}
                title={
                    <Box display="flex" justifyContent="center" sx={{ ml: 10 }}>
                        <Typography noWrap variant="h6">
                            {getLegendTitle()}
                        </Typography>
                    </Box>
                }
                programData={mapData.data}
                prepColor={mapColor}
                emptyState={[]}
                isRatio={false}
                notDollar={!!showMeanValues}
            />
        </Box>
    );
};
export default MapLegend;
