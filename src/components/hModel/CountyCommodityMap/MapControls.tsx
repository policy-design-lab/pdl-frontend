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
import InfoTooltip from "./InfoTooltip";

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

    const handleYearRangeChange = (event, newValue) => {
        if (newValue !== null) {
            setYearRange([newValue]);

            if (newValue === 0) {
                setAggregationEnabled(false);
                setYearAggregation(0);
            }
        }
    };

    const selectedYear = availableYears[yearRange[0]];
    const isAggregationDisabled = yearRange[0] === 0;

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
                <Box sx={{ display: "flex", alignItems: "top", mb: 1, justifyContent: "space-between" }}>
                    <FormLabel
                        component="legend"
                        sx={{
                            fontWeight: "bold",
                            fontSize: "1rem",
                            color: "rgba(47, 113, 100, 1)",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        Year Selection
                        <InfoTooltip title="Control the time period for displayed data. In 'Single' mode, select a specific fiscal year. In 'Aggregated' mode, you can select multiple years to view aggregated/weighted average data across those years." />
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
                            sx={{ color: "rgba(47, 113, 100, 1)" }}
                            disabled={isAggregationDisabled}
                        />
                    </RadioGroup>
                </Box>

                {aggregationEnabled ? (
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
                                    let newYearRange = [...yearRange];
                                    if (newYearRange.includes(index) && newYearRange.length > 1) {
                                        newYearRange = newYearRange.filter((idx) => idx !== index);
                                    } else if (!newYearRange.includes(index)) {
                                        newYearRange.push(index);
                                    }
                                    setYearRange(newYearRange);
                                }}
                                sx={{
                                    "flex": 1,
                                    "minWidth": "80px",
                                    "color": yearRange.includes(index) ?
                                        "rgba(47, 113, 100, 1)" :
                                        "rgba(47, 113, 100, 0.8)",
                                    "backgroundColor": yearRange.includes(index) ?
                                        "rgba(47, 113, 100, 0.1)" :
                                        "transparent",
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
                ) : (
                    <ToggleButtonGroup
                        value={yearRange[0]}
                        exclusive
                        onChange={handleYearRangeChange}
                        aria-label="selected year"
                        sx={{
                            "display": "flex",
                            "width": "100%",
                            "flexWrap": "wrap",
                            "gap": "4px",
                            ".MuiToggleButtonGroup-grouped": {
                                border: "1px solid rgba(47, 113, 100, 0.5)",
                                mx: "0 !important",
                                borderRadius: "4px !important"
                            }
                        }}
                        size="small"
                    >
                        {availableYears.map((year, index) => (
                            <ToggleButton
                                key={index}
                                value={index}
                                sx={{
                                    "flex": 1,
                                    "minWidth": "80px",
                                    "color":
                                        yearRange[0] === index ? "rgba(47, 113, 100, 1)" : "rgba(47, 113, 100, 0.8)",
                                    "backgroundColor":
                                        yearRange[0] === index ? "rgba(47, 113, 100, 0.1)" : "transparent",
                                    "fontWeight": yearRange[0] === index ? "bold" : "normal",
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
                    </ToggleButtonGroup>
                )}
            </Grid>
        </Grid>
    );
};

export default MapControls;
