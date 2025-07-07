import React from "react";
import { Box, Grid, ToggleButton, ToggleButtonGroup, FormLabel } from "@mui/material";
import InfoTooltip from "./InfoTooltip";

interface MapControlsProps {
    availableYears: string[];
    viewMode: string;
    yearRange: number[];
    showMeanValues: boolean;
    proposedPolicyName: string;
    setViewMode: (mode: string) => void;
    setYearRange: (range: number[]) => void;
    setShowMeanValues: (show: boolean) => void;
    setProposedPolicyName: (name: string) => void;
    setAggregationEnabled: (enabled: boolean) => void;
    setYearAggregation: (aggregation: number) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
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
                    Select Policy Design to View
                    <InfoTooltip title="Select the policy option to view payment projections. Under ‘Current Policy’ payments are projected using the programs as designed in the 2018 Farm Bill. Under ‘Proposed Policy’ payments are projected based on the changes proposed in the 2024 House Agriculture Committee bill. The ‘Policy Differences’ presents the numerical and percentage differences if the proposed policy designs replaced current policy designs. This tab highlights the estimated impacts of the proposed changes." />
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
                    Select Data Projection
                    <InfoTooltip title="Choose the data projections to be visualized on the map. ‘Total Payments ($)’ visualizes the total dollar amount projected for each county, useful for seeing overall funding allocation. ‘Payment Rate ($/acre)’ visualizes the average payment per base acre, useful for understanding the direct impact of policy design changes on farmers and by program crop." />
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
                    Select Crop Year or Combination of Crop Years
                    <InfoTooltip title="Choose the crop year or combination of crop years for which data will be visualized on the map and provided in the table below. The crop year is the year associated with enrollment of the program crop in the farm program (ARC-CO or PLC) and is the year in which the crop is planted and/or harvested. Selecting a single year displays projected payments for only that crop year in both the map and the table; selecting multiple years visualizes an aggregation of those years in the map, with each year included in the table. Note that, in general, Congress authorizes the programs for five crop years." />
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
                            key={`year-${year}`}
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
