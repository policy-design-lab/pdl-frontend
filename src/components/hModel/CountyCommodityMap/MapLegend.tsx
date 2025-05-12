import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import * as d3 from "d3";
import DrawLegendNew from "../../shared/DrawLegend-New";
import { PercentileMode } from "./percentileConfig";
import InfoTooltip from "./InfoTooltip";

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
        const isMultiYearSelection = Array.isArray(selectedYear) && selectedYear.length > 1;
        let yearDisplay = "";
        if (isMultiYearSelection) {
            const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
            yearDisplay = sortedYears.join(", ");
        } else {
            yearDisplay = Array.isArray(selectedYear) ? selectedYear[0] : selectedYear;
        }

        if (viewMode === "difference") {
            title = `${
                showMeanValues ? "Mean Rate" : "Payment"
            } Differences Between Current and Proposed Policy for ${yearDisplay}`;
        } else if (showMeanValues) {
            title = `Mean Payment Rates for ${yearDisplay}`;
        } else {
            title = `Total Payments for ${yearDisplay}`;
        }
        if (selectedState !== "All States") {
            title += ` in ${selectedState}`;
        }
        if (isMultiYearSelection) {
            title += " (Aggregated)";
        } else if (yearAggregation > 0 && !showMeanValues) {
            title += ` (Aggregated with previous ${yearAggregation} year${yearAggregation > 1 ? "s" : ""})`;
        }
        if (viewMode !== "difference") {
            title += viewMode === "current" ? " (Current Policy)" : ` (${proposedPolicyName})`;
        }
        return title;
    };

    const getPercentileModeExplanation = (mode) => {
        if (mode === PercentileMode.DEFAULT) {
            return "Focuses color distribution to highlight extreme values. Uses non-linear percentile thresholds (0, 5, 10, 15, 40, 65, 80, 85, 90, 95, 100) to provide greater visual discrimination at distribution tails. Statistical interpretation: Emphasizes outliers and distributional skewness by allocating more color bands to extreme values.";
        }
        return "Distributes colors evenly across all values using deciles (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100). Statistical interpretation: Provides uniform visual representation across the entire distribution, similar to standard quantile plots with equal-sized bins.";
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
                justifyContent="center"
                alignItems="center"
                mb={1}
                width="100%"
                sx={{ px: 2, position: "relative" }}
            >
                <Box sx={{ flex: 1, visibility: "hidden", minWidth: 190 }}>
                    {/* Spacer element to balance the title */}
                </Box>
                <Box sx={{ textAlign: "center", position: "absolute", left: 0, right: 0, margin: "0 auto" }}>
                    <Typography variant="h6" noWrap>
                        {getLegendTitle()}
                    </Typography>
                </Box>
                <Box sx={{ minWidth: 190, flexShrink: 0, zIndex: 1 }}>
                    <FormControl size="small" fullWidth>
                        <Box display="flex" alignItems="center">
                            <InputLabel id="percentile-mode-label">Map Coloring</InputLabel>
                            <Select
                                labelId="percentile-mode-label"
                                value={percentileMode}
                                label="Map Coloring"
                                onChange={(e) => onPercentileModeChange(e.target.value)}
                            >
                                <MenuItem value={PercentileMode.DEFAULT}>
                                    <Box display="flex" alignItems="center">
                                        <Box>
                                            <Typography variant="body2">Highlight Extremes</Typography>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block' }}>
                                                Non-linear percentiles
                                            </Typography>
                                        </Box>
                                        <InfoTooltip title={getPercentileModeExplanation(PercentileMode.DEFAULT)} />
                                    </Box>
                                </MenuItem>
                                <MenuItem value={PercentileMode.EQUAL}>
                                    <Box display="flex" alignItems="center">
                                        <Box>
                                            <Typography variant="body2">Balanced Distribution</Typography>
                                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block' }}>
                                                Equal deciles (10%)
                                            </Typography>
                                        </Box>
                                        <InfoTooltip title={getPercentileModeExplanation(PercentileMode.EQUAL)} />
                                    </Box>
                                </MenuItem>
                            </Select>
                        </Box>
                    </FormControl>
                </Box>
            </Box>
            <Box sx={{ width: "100%" }}>
                <DrawLegendNew
                    key={`legend-${
                        Array.isArray(selectedYear) ? selectedYear.join("-") : selectedYear
                    }-${viewMode}-${showMeanValues}-${selectedState}-${yearAggregation}-${percentileMode}`}
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
