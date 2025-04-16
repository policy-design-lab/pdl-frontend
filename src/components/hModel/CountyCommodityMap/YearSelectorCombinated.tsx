import React, { useEffect } from "react";
import { Box, FormLabel, Slider, Typography, Switch, FormControlLabel } from "@mui/material";

const YearSelectorCombined = ({
    availableYears,
    yearRange,
    setYearRange,
    aggregationEnabled,
    setAggregationEnabled,
    setYearAggregation,
    showMeanValues
}) => {
    useEffect(() => {
        if (aggregationEnabled) {
            setYearAggregation(yearRange[0]);
        }
    }, [yearRange, aggregationEnabled, setYearAggregation]);

    const handleYearChange = (event, newValue) => {
        event.preventDefault();
        setYearRange([newValue]);
    };

    const handleAggregationToggle = (event) => {
        const isEnabled = event.target.checked;
        setAggregationEnabled(isEnabled);
        if (isEnabled) {
            setYearAggregation(yearRange[0]);
        } else {
            setYearAggregation(0);
        }
    };

    const selectedYear = availableYears[yearRange[0]];
    const currentYearIndex = yearRange[0];
    const earliestYearShown = aggregationEnabled ? availableYears[0] : selectedYear;
    const isAggregationDisabled = currentYearIndex === 0;

    return (
        <Box>
            <FormLabel
                component="legend"
                sx={{
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    color: "rgba(47, 113, 100, 1)",
                    mb: 1
                }}
            >
                Year Selection
            </FormLabel>
            <Box sx={{ mb: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={aggregationEnabled}
                            onChange={handleAggregationToggle}
                            disabled={isAggregationDisabled}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "rgba(47, 113, 100, 1)"
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "rgba(47, 113, 100, 0.5)"
                                }
                            }}
                        />
                    }
                    label={
                        isAggregationDisabled
                            ? "Aggregation not available for earliest year"
                            : aggregationEnabled
                            ? "Show data aggregated from earliest to selected year"
                            : "Show selected year only"
                    }
                    sx={{
                        color: isAggregationDisabled ? "rgba(47, 113, 100, 0.5)" : "rgba(47, 113, 100, 1)"
                    }}
                />
            </Box>
            <Box sx={{ px: 2, maxWidth: 500, mx: "auto", height: 80 }}>
                <Typography
                    variant="body2"
                    gutterBottom
                    sx={{
                        color: "rgba(47, 113, 100, 0.8)",
                        fontWeight: "medium"
                    }}
                >
                    {aggregationEnabled
                        ? `Showing ${
                              showMeanValues ? "mean rates" : "sum"
                          } of all data from ${earliestYearShown} through ${selectedYear}`
                        : `Showing data for ${selectedYear} only`}
                </Typography>
                <Slider
                    value={yearRange[0]}
                    onChange={handleYearChange}
                    valueLabelDisplay="on"
                    valueLabelFormat={(index) => availableYears[index]}
                    step={1}
                    marks={availableYears.map((year, index) => ({
                        value: index,
                        label: year
                    }))}
                    min={0}
                    max={availableYears.length - 1}
                    sx={{
                        "color": "rgba(47, 113, 100, 1)",
                        "& .MuiSlider-valueLabel": {
                            backgroundColor: "rgba(47, 113, 100, 1)",
                            top: -6
                        },
                        "& .MuiSlider-track": {
                            display: aggregationEnabled ? "block" : "none",
                            backgroundColor: "rgba(47, 113, 100, 0.6)",
                            height: 4
                        },
                        "& .MuiSlider-rail": {
                            backgroundColor: "rgba(47, 113, 100, 0.2)",
                            opacity: 1,
                            height: 4
                        },
                        "& .MuiSlider-thumb": {
                            "backgroundColor": "rgba(47, 113, 100, 1)",
                            "&:hover, &.Mui-focusVisible": {
                                boxShadow: "0px 0px 0px 8px rgba(47, 113, 100, 0.16)"
                            }
                        }
                    }}
                />
            </Box>
        </Box>
    );
};
export default YearSelectorCombined;
