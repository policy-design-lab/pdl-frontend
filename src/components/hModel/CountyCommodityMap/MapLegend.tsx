import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import * as d3 from "d3";
import DrawLegendNew from "../../shared/DrawLegend-New";
import { PercentileMode } from "./percentileConfig";

const MapLegend = ({
    mapData,
    mapColor,
    viewMode,
    selectedYear,
    selectedState,
    yearAggregation,
    showMeanValues,
    proposedPolicyName,
    stateCodeToName,
    showTooltips = true,
    percentileMode,
    onPercentileModeChange
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
        <Box 
            sx={{ 
                width: "100%", 
                display: "flex", 
                flexDirection: "column",
                minHeight: 200
            }}
        >
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={1} 
                width="100%"
                sx={{ px: 2 }}
            >
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="h6" noWrap>
                        {getLegendTitle()}
                    </Typography>
                </Box>
                <Box sx={{ minWidth: 160, flexShrink: 0 }}>
                    <FormControl size="small" fullWidth>
                        <InputLabel id="percentile-mode-label">Percentile Mode</InputLabel>
                        <Select
                            labelId="percentile-mode-label"
                            value={percentileMode}
                            label="Percentile Mode"
                            onChange={(e) => onPercentileModeChange(e.target.value)}
                        >
                            <MenuItem value={PercentileMode.DEFAULT}>Default Percentiles</MenuItem>
                            <MenuItem value={PercentileMode.EQUAL}>Equal Percentiles</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Box sx={{ width: "100%" }}>
                <DrawLegendNew
                    key={`legend-${selectedYear}-${viewMode}-${showMeanValues}-${selectedState}-${yearAggregation}-${percentileMode}`}
                    colorScale={colorScale}
                    title={null}
                    programData={mapData.data}
                    prepColor={mapColor}
                    emptyState={[]}
                    isRatio={false}
                    notDollar={!!showMeanValues}
                    countyData={mapData.counties}
                    showPercentileExplanation
                    stateCodeToName={stateCodeToName}
                    showTooltips={showTooltips}
                    regionType="county"
                    percentileMode={percentileMode}
                />
            </Box>
        </Box>
    );
};

export default MapLegend;
