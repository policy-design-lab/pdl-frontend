import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import MapLegend from "./MapLegend";
import CountyMap from "./CountyMap";
import { processMapData } from "./processMapData";
import MapControls from "./MapControls";
import FilterSelectors from "./FilterSelectors";
import TableIndicator from "./TableIndicator";

const CountyCommodityMap = ({
    countyData,
    stateCodesData,
    countyDataProposed,
    allStates,
    availableYears,
    availableCommodities,
    availablePrograms,
    isLoading,
    onMapUpdate,
    showMeanValues,
    setShowMeanValues,
    yearAggregation,
    setYearAggregation,
    aggregationEnabled,
    setAggregationEnabled
}) => {
    const [content, setContent] = useState("");
    const [selectedYear, setSelectedYear] = useState(availableYears[0] || "2024");
    const [selectedCommodities, setSelectedCommodities] = useState(["All Commodities"]);
    const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
    const [selectedState, setSelectedState] = useState("All States");
    const [viewMode, setViewMode] = useState("current");
    const [proposedPolicyName, setProposedPolicyName] = useState("2025 Policy");
    const [yearRange, setYearRange] = useState([availableYears.indexOf(selectedYear)]);
    const [forceUpdate, setForceUpdate] = useState(0);
    const [showTableIndicator, setShowTableIndicator] = useState(false);
    const [indicatorMessage, setIndicatorMessage] = useState("");
    const [isAtTop, setIsAtTop] = useState(false);

    useEffect(() => {
        let mounted = true;
        return () => {
            mounted = false;
        };
    }, [selectedCommodities]);

    useEffect(() => {
        let mounted = true;
        return () => {
            mounted = false;
        };
    }, [selectedPrograms]);

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            const newYear = availableYears[yearRange[0]] || "2024";
            setSelectedYear(newYear);
            if (onMapUpdate) {
                onMapUpdate(newYear, selectedCommodities, selectedPrograms, selectedState, viewMode);
            }
        }
        return () => {
            mounted = false;
        };
    }, [yearRange, availableYears, onMapUpdate, selectedCommodities, selectedPrograms, selectedState, viewMode]);

    useEffect(() => {
        if (onMapUpdate) {
            onMapUpdate(selectedYear, selectedCommodities, selectedPrograms, selectedState, viewMode);
        }
    }, [selectedYear, selectedCommodities, selectedPrograms, selectedState, viewMode, onMapUpdate]);

    useEffect(() => {
        const hasCommoditySelection =
            selectedCommodities.length > 0 &&
            !(selectedCommodities.length === 1 && selectedCommodities[0] === "All Commodities");
        const hasYearSelection = yearRange.length > 1 || (aggregationEnabled && yearAggregation > 0);
        const hasProgramSelection =
            selectedPrograms.length > 0 && !(selectedPrograms.length === 1 && selectedPrograms[0] === "All Programs");

        const shouldShowIndicator = hasCommoditySelection || hasYearSelection || hasProgramSelection;
        setShowTableIndicator(shouldShowIndicator);

        if (shouldShowIndicator) {
            let message = "View detailed breakdown in table";
            const breakdowns = [];

            if (hasCommoditySelection) {
                breakdowns.push("Commodity breakdown");
            }
            if (hasYearSelection) {
                breakdowns.push("Yearly breakdown");
            }
            if (hasProgramSelection) {
                breakdowns.push("Program breakdown");
            }

            if (breakdowns.length > 0) {
                message += ` (${breakdowns.join(", ")})`;
            }

            setIndicatorMessage(message);
        }
    }, [selectedCommodities, yearRange, yearAggregation, aggregationEnabled, selectedPrograms]);

    const handleSetSelectedCommodities = (newValue) => {
        if (JSON.stringify(selectedCommodities) !== JSON.stringify(newValue)) {
            setSelectedCommodities(newValue);
            setForceUpdate((prev) => prev + 1);
            if (onMapUpdate) {
                onMapUpdate(selectedYear, newValue, selectedPrograms, selectedState, viewMode);
            }
        }
    };

    const handleSetSelectedPrograms = (newValue) => {
        if (JSON.stringify(selectedPrograms) !== JSON.stringify(newValue)) {
            setSelectedPrograms(newValue);
            setForceUpdate((prev) => prev + 1);
            if (onMapUpdate) {
                onMapUpdate(selectedYear, selectedCommodities, newValue, selectedState, viewMode);
            }
        }
    };

    const handleSetSelectedState = (newValue) => {
        if (selectedState !== newValue) {
            setSelectedState(newValue);
            setForceUpdate((prev) => prev + 1);
            if (onMapUpdate) {
                onMapUpdate(selectedYear, selectedCommodities, selectedPrograms, newValue, viewMode);
            }
        }
    };

    const handleTooltipChange = (newContent) => {
        setContent(newContent);
    };

    const handleSetViewMode = (newValue) => {
        setViewMode(newValue);
        if (onMapUpdate) {
            onMapUpdate(selectedYear, selectedCommodities, selectedPrograms, selectedState, newValue);
        }
    };

    const handleScrollToTable = () => {
        const tableElement = document.getElementById("county-commodity-table");
        if (tableElement) {
            if (isAtTop) {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setIsAtTop(false);
            } else {
                tableElement.scrollIntoView({ behavior: "smooth" });
                setIsAtTop(true);
            }
        }
    };

    const mapData = useMemo(() => {
        if (!selectedYear) return { counties: {}, thresholds: [], data: [] };
        const result = processMapData({
            countyData,
            countyDataProposed,
            selectedYear,
            viewMode,
            selectedCommodities,
            selectedPrograms,
            selectedState,
            stateCodesData,
            yearAggregation,
            showMeanValues
        });
        return result;
    }, [
        countyData,
        countyDataProposed,
        selectedYear,
        viewMode,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        stateCodesData,
        yearAggregation,
        showMeanValues,
        forceUpdate
    ]);

    const mapKey = useMemo(() => {
        return `${selectedCommodities.join("|")}-${selectedPrograms.join(
            "|"
        )}-${selectedState}-${viewMode}-${selectedYear}-${forceUpdate}`;
    }, [selectedCommodities, selectedPrograms, selectedState, viewMode, selectedYear, forceUpdate]);

    const mapColor = useMemo(() => {
        if (viewMode === "difference") {
            return ["#f3e5f5", "#ce93d8", "#9c27b0", "#7b1fa2", "#4a148c"];
        }
        if (viewMode === "current") {
            return ["#c8e6c9", "#81c784", "#4caf50", "#2e7d32", "#1b5e20"];
        }
        if (viewMode === "proposed") {
            return ["#e3f2fd", "#90caf9", "#42a5f5", "#1976d2", "#0d47a1"];
        }

        if (showMeanValues) {
            return ["#c6dbef", "#6baed6", "#4292c6", "#2171b5", "#08306b"];
        }

        return ["#fdd0a2", "#f16913", "#d94801", "#a63603", "#7f2704"];
    }, [viewMode, showMeanValues]);

    const effectiveYear = useMemo(() => {
        if (aggregationEnabled && yearAggregation > 0) {
            const startYear = availableYears[yearRange[0]];
            const endYear = availableYears[Math.min(yearRange[0] + yearAggregation, availableYears.length - 1)];
            return `${startYear}-${endYear}`;
        }
        return selectedYear;
    }, [selectedYear, yearRange, yearAggregation, aggregationEnabled, availableYears]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ my: 5 }}>
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        border: "1px solid rgba(47, 113, 100, 0.2)",
                        mb: 3
                    }}
                >
                    <MapControls
                        availableYears={availableYears}
                        viewMode={viewMode}
                        yearRange={yearRange}
                        yearAggregation={yearAggregation}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                        setViewMode={handleSetViewMode}
                        setYearRange={setYearRange}
                        setShowMeanValues={setShowMeanValues}
                        setProposedPolicyName={setProposedPolicyName}
                        aggregationEnabled={aggregationEnabled}
                        setAggregationEnabled={setAggregationEnabled}
                        setYearAggregation={setYearAggregation}
                    />

                    <Box
                        sx={{
                            mt: 3,
                            pt: 3,
                            borderTop: "1px solid rgba(47, 113, 100, 0.2)"
                        }}
                    >
                        <FilterSelectors
                            availableCommodities={availableCommodities}
                            availablePrograms={availablePrograms}
                            stateCodesData={stateCodesData}
                            selectedCommodities={selectedCommodities}
                            selectedPrograms={selectedPrograms}
                            selectedState={selectedState}
                            setSelectedCommodities={handleSetSelectedCommodities}
                            setSelectedPrograms={handleSetSelectedPrograms}
                            setSelectedState={handleSetSelectedState}
                        />
                    </Box>
                </Box>

                <Box sx={{ mt: 5 }}>
                    <MapLegend
                        mapData={mapData}
                        mapColor={mapColor}
                        viewMode={viewMode}
                        selectedYear={selectedYear}
                        selectedState={selectedState}
                        yearAggregation={yearAggregation}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                    />
                </Box>
            </Box>
            <Box
                sx={{
                    overflow: "hidden"
                }}
            >
                <CountyMap
                    mapData={mapData}
                    mapColor={mapColor}
                    viewMode={viewMode}
                    selectedState={selectedState}
                    stateCodesData={stateCodesData}
                    allStates={allStates}
                    isLoading={isLoading}
                    onTooltipChange={handleTooltipChange}
                    tooltipContent={content}
                    showMeanValues={showMeanValues}
                    selectedPrograms={selectedPrograms}
                    yearAggregation={yearAggregation}
                    selectedCommodities={selectedCommodities}
                    setSelectedState={handleSetSelectedState}
                    key={mapKey}
                />
            </Box>
            {showTableIndicator && (
                <TableIndicator message={indicatorMessage} onClick={handleScrollToTable} isAtTop={isAtTop} />
            )}
        </Box>
    );
};

export default CountyCommodityMap;
