import React from "react";
import { Box, Grid, ToggleButton, ToggleButtonGroup, FormLabel } from "@mui/material";
import InfoTooltip from "./InfoTooltip";
import YearToggleGroup from "../../shared/selectors/YearToggleGroup";
import { toggleIndexNeverEmpty } from "../../shared/selectors/multiSelectUtils";
import { formLabelStyleBasic, toggleButtonSx } from "../../shared/selectors/selectorStyles";

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
    enableScenarioSwitching?: boolean;
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
    setYearAggregation,
    enableScenarioSwitching = true
}) => {
    const handleViewModeChange = (event, newValue) => {
        if (newValue) {
            setViewMode(newValue);
            if (newValue === "proposed" && !proposedPolicyName) {
                setProposedPolicyName("Proposed Policy");
            }
        }
    };

    const handleYearSelectionChange = (yearIndex) => {
        const newYearRange = toggleIndexNeverEmpty(yearRange, yearIndex);

        setYearRange(newYearRange);

        const isAggregated = newYearRange.length > 1;
        setAggregationEnabled(isAggregated);

        if (isAggregated) {
            setYearAggregation(newYearRange[0]);
        } else {
            setYearAggregation(0);
        }
    };

    return (
        <Grid container spacing={3} alignItems="flex-start">
            {enableScenarioSwitching && (
                <Grid item xs={12} md={4}>
                    <FormLabel component="legend" sx={formLabelStyleBasic}>
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
                        <ToggleButton value="current" sx={{ ...toggleButtonSx(viewMode === "current"), flex: 1 }}>
                            Current Policy
                        </ToggleButton>
                        <ToggleButton value="proposed" sx={{ ...toggleButtonSx(viewMode === "proposed"), flex: 1 }}>
                            Proposed Policy
                        </ToggleButton>
                        <ToggleButton value="difference" sx={{ ...toggleButtonSx(viewMode === "difference"), flex: 1 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div>Difference</div>
                                <div style={{ fontSize: "0.5rem" }}>(Proposed - Current)</div>
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            )}

            <Grid item xs={12} md={4}>
                <FormLabel component="legend" sx={formLabelStyleBasic}>
                    Select Data Projection
                    <InfoTooltip title="Choose the data projections to be visualized on the map. ‘Payment Rate ($/base acre)’ visualizes the average payment per base acre, useful for understanding the direct impact of policy design changes on farmers and by program crop. ‘Total Payments ($)’ visualizes the total dollar amount projected for each county, useful for seeing overall funding allocation." />
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
                    <ToggleButton value="mean" sx={{ ...toggleButtonSx(showMeanValues), flex: 1 }}>
                        Payment Rate ($/base acre)
                    </ToggleButton>
                    <ToggleButton value="total" sx={{ ...toggleButtonSx(!showMeanValues), flex: 1 }}>
                        Total Payments ($)
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={enableScenarioSwitching ? 4 : 8}>
                <FormLabel component="legend" sx={formLabelStyleBasic}>
                    Select Crop Year or Combination of Crop Years
                    <InfoTooltip title="Choose the crop year or combination of crop years for which data will be visualized on the map and provided in the table below. The crop year is the year associated with enrollment of the program crop in the farm program (ARC-CO or PLC) and is the year in which the crop is planted and/or harvested. Selecting a single year displays projected payments for only that crop year in both the map and the table; selecting multiple years visualizes an aggregation of those years in the map, with each year included in the table. Note that, in general, Congress authorizes the programs for five crop years." />
                </FormLabel>

                <YearToggleGroup
                    years={availableYears}
                    selectedIndices={yearRange}
                    onToggle={handleYearSelectionChange}
                />
            </Grid>
        </Grid>
    );
};

export default MapControls;
