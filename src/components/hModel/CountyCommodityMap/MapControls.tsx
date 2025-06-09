import React from "react";
import { Box, Grid, ToggleButton, ToggleButtonGroup, FormLabel } from "@mui/material";
import InfoTooltip from "./InfoTooltip";

const MapControls = ({
    availableYears,
    viewMode,
    yearRange,
    showMeanValues,
    proposedPolicyName,
    setViewMode,
    setYearRange,
    setShowMeanValues,
    setProposedPolicyName,
    setAggregationEnabled,
    setYearAggregation
}) => {
    const handleViewModeChange = (event, newValue) => {
        if (newValue) {
            setViewMode(newValue);
            if (newValue === "proposed" && !proposedPolicyName) {
                setProposedPolicyName("2025 Policy");
            }
        }
    };

    const handleYearSelectionChange = (yearIndex) => {
        let newYearRange = [...yearRange];
        if (newYearRange.includes(yearIndex) && newYearRange.length > 1) {
            newYearRange = newYearRange.filter((idx) => idx !== yearIndex);
        } else if (!newYearRange.includes(yearIndex)) {
            newYearRange.push(yearIndex);
        }

        setYearRange(newYearRange);

        const isAggregated = newYearRange.length > 1;
        setAggregationEnabled(isAggregated);

        if (isAggregated) {
            setYearAggregation(newYearRange[0]);
        } else {
            setYearAggregation(0);
        }
    };

    const toggleButtonHeight = "44px";

    return (
        <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={4}>
                <FormLabel
                    component="legend"
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "rgba(47, 113, 100, 1)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    Data View Mode
                    <InfoTooltip title="Select how to view the data. 'Current Policy' shows payments under existing farm bill policies. 'Proposed' shows projected payments under proposed changes. 'Policy Differences' shows the numerical and percentage differences between current and proposed policies to highlight the impact of changes." />
                </FormLabel>
                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                    sx={{
                        display: "flex",
                        width: "100%"
                    }}
                    size="small"
                >
                    <ToggleButton
                        value="current"
                        sx={{
                            "flex": 1,
                            "color": viewMode === "current" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                            "backgroundColor": viewMode === "current" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                            "fontWeight": viewMode === "current" ? "bold" : "normal",
                            "border": "1px solid rgba(47, 113, 100, 0.5)",
                            "height": toggleButtonHeight,
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.05)"
                            }
                        }}
                    >
                        Current Policy
                    </ToggleButton>
                    <ToggleButton
                        value="proposed"
                        sx={{
                            "flex": 1,
                            "color": viewMode === "proposed" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                            "backgroundColor": viewMode === "proposed" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                            "fontWeight": viewMode === "proposed" ? "bold" : "normal",
                            "border": "1px solid rgba(47, 113, 100, 0.5)",
                            "height": toggleButtonHeight,
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.05)"
                            }
                        }}
                    >
                        Proposed Policy
                    </ToggleButton>
                    <ToggleButton
                        value="difference"
                        sx={{
                            "flex": 1,
                            "color": viewMode === "difference" ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                            "backgroundColor": viewMode === "difference" ? "rgba(47, 113, 100, 0.1)" : "transparent",
                            "fontWeight": viewMode === "difference" ? "bold" : "normal",
                            "border": "1px solid rgba(47, 113, 100, 0.5)",
                            "height": toggleButtonHeight,
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.05)"
                            }
                        }}
                    >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div>Difference</div>
                            <div style={{ fontSize: "0.5rem" }}>(Proposed - Current)</div>
                        </Box>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>

            <Grid item xs={12} md={4}>
                <FormLabel
                    component="legend"
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "rgba(47, 113, 100, 1)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    Displayed Metrics
                    <InfoTooltip title="Choose which metrics to display on the map. 'Total Payments ($)' shows the total dollar amount distributed to each county, useful for seeing overall funding allocation. 'Payment Rate ($/acre)' shows the average payment per acre." />
                </FormLabel>
                <ToggleButtonGroup
                    value={showMeanValues ? "mean" : "total"}
                    exclusive
                    onChange={(e, newValue) => {
                        if (newValue) setShowMeanValues(newValue === "mean");
                    }}
                    aria-label="value type"
                    sx={{
                        display: "flex",
                        width: "100%"
                    }}
                    size="small"
                >
                    <ToggleButton
                        value="total"
                        sx={{
                            "flex": 1,
                            "color": !showMeanValues ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                            "backgroundColor": !showMeanValues ? "rgba(47, 113, 100, 0.1)" : "transparent",
                            "fontWeight": !showMeanValues ? "bold" : "normal",
                            "border": "1px solid rgba(47, 113, 100, 0.5)",
                            "height": toggleButtonHeight,
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.05)"
                            }
                        }}
                    >
                        Total Payments ($)
                    </ToggleButton>
                    <ToggleButton
                        value="mean"
                        sx={{
                            "flex": 1,
                            "color": showMeanValues ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                            "backgroundColor": showMeanValues ? "rgba(47, 113, 100, 0.1)" : "transparent",
                            "fontWeight": showMeanValues ? "bold" : "normal",
                            "border": "1px solid rgba(47, 113, 100, 0.5)",
                            "height": toggleButtonHeight,
                            "&:hover": {
                                backgroundColor: "rgba(47, 113, 100, 0.05)"
                            }
                        }}
                    >
                        Payment Rate ($/acre)
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={4}>
                <FormLabel
                    component="legend"
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "rgba(47, 113, 100, 1)",
                        mb: 1,
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    Year Selection
                    <InfoTooltip title="Select one or more years for analysis. When you select a single year, the map and table show data for that specific year only. When you select multiple years, the system automatically switches to aggregated mode, combining data across all selected years and showing yearly breakdowns in the table." />
                </FormLabel>

                <Box
                    sx={{
                        "display": "flex",
                        "width": "100%",
                        "flexWrap": "wrap",
                        "gap": "4px",
                        ".MuiToggleButton-root": {
                            borderRadius: "4px !important"
                        }
                    }}
                >
                    {availableYears.map((year, index) => (
                        <ToggleButton
                            key={index}
                            value={index}
                            selected={yearRange.includes(index)}
                            onClick={() => {
                                handleYearSelectionChange(index);
                            }}
                            sx={{
                                "flex": 1,
                                "minWidth": "80px",
                                "color": yearRange.includes(index)
                                    ? "rgba(47, 113, 100, 1)"
                                    : "rgba(47, 113, 100, 0.8)",
                                "backgroundColor": yearRange.includes(index)
                                    ? "rgba(47, 113, 100, 0.1)"
                                    : "transparent",
                                "fontWeight": yearRange.includes(index) ? "bold" : "normal",
                                "border": "1px solid rgba(47, 113, 100, 0.5)",
                                "height": toggleButtonHeight,
                                "&:hover": {
                                    backgroundColor: "rgba(47, 113, 100, 0.05)"
                                },
                                "marginBottom": "4px"
                            }}
                        >
                            {year}
                        </ToggleButton>
                    ))}
                </Box>
            </Grid>
        </Grid>
    );
};

export default MapControls;
