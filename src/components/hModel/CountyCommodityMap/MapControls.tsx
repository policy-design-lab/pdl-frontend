import React, { useMemo } from "react";
import { Box } from "@mui/material";
import FilterSelectors from "./FilterSelectors";
import ValueTypeToggle from "./ValueTypeToggle";
import ViewModeSelector from "./ViewModelSelector";
import YearSelectorCombined from "./YearSelectorCombinated";

const MapControls = ({
    availableYears,
    availableCommodities,
    availablePrograms,
    stateCodesData,
    selectedCommodities,
    selectedPrograms,
    selectedState,
    viewMode,
    yearRange,
    yearAggregation,
    showMeanValues,
    proposedPolicyName,
    setSelectedCommodities,
    setSelectedPrograms,
    setSelectedState,
    setViewMode,
    setYearRange,
    setYearAggregation,
    setShowMeanValues,
    setProposedPolicyName,
    aggregationEnabled,
    setAggregationEnabled
}) => {
    const isMeanToggleDisabled = useMemo(() => {
        const hasSpecificProgram =
            selectedPrograms.length === 1 &&
            !selectedPrograms.includes("All Programs") &&
            (selectedPrograms[0].includes("ARC") || selectedPrograms[0].includes("PLC"));

        return !hasSpecificProgram;
    }, [selectedPrograms]);
    return (
        <Box sx={{ my: 4, display: "flex", flexDirection: "column", gap: 3 }}>
            <ViewModeSelector
                viewMode={viewMode}
                setViewMode={setViewMode}
                proposedPolicyName={proposedPolicyName}
                setProposedPolicyName={setProposedPolicyName}
            />
            <ValueTypeToggle
                showMeanValues={showMeanValues}
                setShowMeanValues={setShowMeanValues}
                disabled={isMeanToggleDisabled}
            />
            <YearSelectorCombined
                availableYears={availableYears}
                yearRange={yearRange}
                setYearRange={setYearRange}
                aggregationEnabled={aggregationEnabled}
                setAggregationEnabled={setAggregationEnabled}
                setYearAggregation={setYearAggregation}
                showMeanValues={showMeanValues}
            />
            <FilterSelectors
                availableCommodities={availableCommodities}
                availablePrograms={availablePrograms}
                stateCodesData={stateCodesData}
                selectedCommodities={selectedCommodities}
                selectedPrograms={selectedPrograms}
                selectedState={selectedState}
                setSelectedCommodities={setSelectedCommodities}
                setSelectedPrograms={setSelectedPrograms}
                setSelectedState={setSelectedState}
            />
        </Box>
    );
};

export default MapControls;
