import React from "react";
import {
    Box,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography
} from "@mui/material";

const MapControls = ({
    availableYears,
    viewMode,
    yearRange,
    yearAggregation,
    showMeanValues,
    proposedPolicyName,
    setViewMode,
    setYearRange,
    setShowMeanValues,
    setProposedPolicyName,
    aggregationEnabled,
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

    const handleAggregationChange = (event) => {
        const isEnabled = event.target.value === "aggregated";
        setAggregationEnabled(isEnabled);
        if (isEnabled) {
            setYearAggregation(yearRange[0]);
        } else {
            setYearAggregation(0);
        }
    };

    const selectedYear = availableYears[yearRange[0]];
    const earliestYearShown = aggregationEnabled ? availableYears[0] : selectedYear;
    const isAggregationDisabled = yearRange[0] === 0;

    return (
        <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={4}>
                <FormLabel
                    component="legend"
                    sx={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "rgba(47, 113, 100, 1)",
                        mb: 1
                    }}
                >
                    Data View Mode
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
                        mb: 1
                    }}
                >
                    Displayed Metrics
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
                <Box sx={{ display: "flex", alignItems: "top", mb: 1, justifyContent: "space-between" }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "rgba(47, 113, 100, 1)"
                        }}
                    >
                        Year Selection
                    </FormLabel>
                    <RadioGroup
                        row
                        value={aggregationEnabled ? "aggregated" : "single"}
                        onChange={handleAggregationChange}
                    >
                        <FormControlLabel
                            value="single"
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        "py": 0,
                                        "color": "rgba(47, 113, 100, 0.8)",
                                        "&.Mui-checked": {
                                            color: "rgba(47, 113, 100, 1)"
                                        }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontSize: "0.75rem", py: 0 }}>
                                    Single
                                </Typography>
                            }
                            sx={{
                                mr: 1,
                                color: "rgba(47, 113, 100, 1)"
                            }}
                        />
                        <FormControlLabel
                            value="aggregated"
                            disabled={isAggregationDisabled}
                            control={
                                <Radio
                                    size="small"
                                    sx={{
                                        "py": 0,
                                        "color": "rgba(47, 113, 100, 0.8)",
                                        "&.Mui-checked": {
                                            color: "rgba(47, 113, 100, 1)"
                                        }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontSize: "0.75rem", py: 0 }}>
                                    Aggregated
                                </Typography>
                            }
                            sx={{
                                color: isAggregationDisabled ? "rgba(47, 113, 100, 0.5)" : "rgba(47, 113, 100, 1)"
                            }}
                        />
                    </RadioGroup>
                </Box>
                <ToggleButtonGroup
                    value={yearRange[0]}
                    exclusive
                    onChange={(e, newValue) => {
                        if (newValue !== null) setYearRange([newValue]);
                    }}
                    aria-label="year selection"
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        width: "100%"
                    }}
                    size="small"
                >
                    {availableYears.map((year, index) => (
                        <ToggleButton
                            key={year}
                            value={index}
                            sx={{
                                "flex": "0 0 auto",
                                "margin": "0 4px 4px 0",
                                "color": yearRange[0] === index ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                                "backgroundColor":
                                    yearRange[0] === index ||
                                    (aggregationEnabled && year >= yearRange[0] && year <= selectedYear)
                                        ? "rgba(47, 113, 100, 0.1)"
                                        : "transparent",
                                "fontWeight":
                                    yearRange[0] === index ||
                                    (aggregationEnabled && year >= yearRange[0] && year <= selectedYear)
                                        ? "bold"
                                        : "normal",
                                "border": "1px solid rgba(47, 113, 100, 0.5)",
                                "&:hover": {
                                    backgroundColor: "rgba(47, 113, 100, 0.05)"
                                }
                            }}
                        >
                            {year}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
                {aggregationEnabled && !isAggregationDisabled && (
                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            mt: 0.5,
                            color: "rgba(47, 113, 100, 0.8)",
                            fontSize: "0.75rem"
                        }}
                    >
                        Showing data from {availableYears[0]} to {selectedYear}
                    </Typography>
                )}
            </Grid>
        </Grid>
    );
};

export default MapControls;
