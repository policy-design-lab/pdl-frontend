import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import * as d3 from "d3";
import DrawLegendNew from "../../shared/DrawLegend-New";
import { PercentileMode } from "./percentileConfig";
import InfoTooltip from "./InfoTooltip";

interface MapLegendProps {
    mapData: { thresholds: number[]; data: unknown[]; counties: Record<string, unknown> };
    mapColor: string[];
    viewMode: string;
    selectedYear: string | string[];
    selectedState: string;
    yearAggregation: number;
    showMeanValues: boolean;
    proposedPolicyName: string;
    stateCodeToName: Record<string, string>;
    showTooltips?: boolean;
    percentileMode: string;
    onPercentileModeChange: (mode: string) => void;
    selectedCommodities?: string[];
}

const MapLegend: React.FC<MapLegendProps> = ({
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
    onPercentileModeChange,
    selectedCommodities = []
}) => {
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);

    const getLegendTitle = () => {
        const isMultiYearSelection = Array.isArray(selectedYear) && selectedYear.length > 1;
        let yearDisplay = "";
        if (isMultiYearSelection) {
            const sortedYears = [...selectedYear].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

            const areConsecutive = (years) => {
                for (let i = 1; i < years.length; i += 1) {
                    if (parseInt(years[i], 10) - parseInt(years[i - 1], 10) !== 1) {
                        return false;
                    }
                }
                return true;
            };

            if (sortedYears.length === 2) {
                yearDisplay = `${sortedYears[0]}-${sortedYears[1]}`;
            } else if (areConsecutive(sortedYears)) {
                yearDisplay = `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`;
            } else if (sortedYears.length <= 4) {
                yearDisplay = sortedYears.join(", ");
            } else {
                yearDisplay = `${sortedYears.length} Selected Years (${sortedYears[0]}-${
                    sortedYears[sortedYears.length - 1]
                })`;
            }
        } else {
            yearDisplay = Array.isArray(selectedYear) ? selectedYear[0] : selectedYear;
        }

        let title = "";
        let policyMode = "";
        let metrics = "";
        let commodityPart = "";

        if (viewMode === "difference") {
            policyMode = "Policy Differences";
            metrics = showMeanValues ? "Mean Rate" : "Payment";
            title = `${metrics} Differences Between Current and Proposed Policy`;
        } else {
            policyMode = viewMode === "current" ? "Current Policy" : `${proposedPolicyName}`;
            metrics = showMeanValues ? "Payment Rate" : "Total Payments";
            title = `${policyMode}: ${metrics}`;
        }

        const hasSpecificCommodities =
            selectedCommodities &&
            selectedCommodities.length > 0 &&
            !(selectedCommodities.length === 1 && selectedCommodities.includes("All Program Crops"));

        if (hasSpecificCommodities) {
            if (selectedCommodities.length === 1) {
                commodityPart = ` for ${selectedCommodities[0]}`;
            } else if (selectedCommodities.length <= 3) {
                commodityPart = ` for ${selectedCommodities.join(", ")}`;
            } else {
                commodityPart = ` for ${selectedCommodities.length} Selected Commodities`;
            }
            title += commodityPart;
        }

        title += ` (${yearDisplay})`;

        if (selectedState !== "All States") {
            title += ` in ${selectedState}`;
        }

        if (isMultiYearSelection) {
            title += " - Aggregated";
        } else if (yearAggregation > 0 && !showMeanValues) {
            title += ` - Aggregated with previous ${yearAggregation} year${yearAggregation > 1 ? "s" : ""}`;
        }

        return title;
    };

    const getPercentileModeExplanation = (mode) => {
        if (mode === PercentileMode.DEFAULT) {
            return "Visualizes using color categories that highlight distributional tails (0, 5, 10, 15, 40, 65, 80, 85, 90, 100 percentiles).\n\nStatistical interpretation: Emphasizes distributional skewness by allocating more color categories to the highest and lowest values. ";
        }
        return "Visualizes using color categories that are equal and distributed evenly across all values (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 percentiles).\n\nStatistical interpretation: Provides uniform visual representation across the entire range of payments with equal-sized categories or color bands.";
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
                alignItems="flex-start"
                mb={1}
                width="100%"
                sx={{
                    px: 2,
                    flexDirection: { xs: "column", md: "row" },
                    gap: { xs: 1, md: 0 }
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        textAlign: { xs: "center", md: "center" },
                        pr: { xs: 0, md: 2 },
                        order: { xs: 2, md: 1 }
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            wordBreak: "break-word",
                            lineHeight: 1.2,
                            fontSize: { xs: "1rem", md: "1.25rem" }
                        }}
                    >
                        {getLegendTitle()}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        minWidth: { xs: "100%", md: 190 },
                        flexShrink: 0,
                        zIndex: 1,
                        order: { xs: 1, md: 2 }
                    }}
                >
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
                                            <Typography variant="body2">Non-linear percentiles</Typography>
                                        </Box>
                                        <InfoTooltip title={getPercentileModeExplanation(PercentileMode.DEFAULT)} />
                                    </Box>
                                </MenuItem>
                                <MenuItem value={PercentileMode.EQUAL}>
                                    <Box display="flex" alignItems="center">
                                        <Box>
                                            <Typography variant="body2">Equal deciles (10%)</Typography>
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
                    programData={mapData.data}
                    prepColor={mapColor}
                    emptyState={[]}
                    isRatio={false}
                    notDollar={false}
                    isPaymentRate={showMeanValues}
                    countyData={mapData.counties}
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
