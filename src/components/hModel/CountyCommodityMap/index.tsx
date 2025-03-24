import React, { useState, useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import MapLegend from "./MapLegend";
import CountyMap from "./CountyMap";
import { processMapData } from "./processMapData";
import MapControls from "./MapControls";

const CountyCommodityMap = ({
    countyData,
    stateCodesData,
    countyDataProposed,
    allStates,
    availableYears,
    availableCommodities,
    availablePrograms,
    isLoading,
    onMapUpdate
}) => {
    const [content, setContent] = useState("");
    const [selectedYear, setSelectedYear] = useState(availableYears[0] || "2024");
    const [selectedCommodities, setSelectedCommodities] = useState(["All Commodities"]);
    const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
    const [selectedState, setSelectedState] = useState("All States");
    const [viewMode, setViewMode] = useState("current");
    const [proposedPolicyName, setProposedPolicyName] = useState("2025 Policy");
    const [showMeanValues, setShowMeanValues] = useState(false);
    const [yearRange, setYearRange] = useState([availableYears.indexOf(selectedYear)]);
    const [yearAggregation, setYearAggregation] = useState(0);
    const [aggregationEnabled, setAggregationEnabled] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

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
        let mounted = true;
        if (mounted) {
            const isMeanValueAllowed =
                selectedPrograms.length === 1 &&
                !selectedPrograms.includes("All Programs") &&
                (selectedPrograms[0].includes("ARC") || selectedPrograms[0].includes("PLC"));
            if (showMeanValues && !isMeanValueAllowed) {
                setShowMeanValues(false);
            }
        }
        return () => {
            mounted = false;
        };
    }, [selectedPrograms, showMeanValues]);

    useEffect(() => {
        if (onMapUpdate) {
            onMapUpdate(selectedYear, selectedCommodities, selectedPrograms, selectedState, viewMode);
        }
    }, [selectedYear, selectedCommodities, selectedPrograms, selectedState, viewMode, onMapUpdate]);

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
            return ["#8B0000", "#D43D51", "#F7F7F7", "#4E9FD1", "#084594"];
        }
        if (showMeanValues) {
            return ["#2c7fb8", "#41a0c2", "#7fcdbb", "#c7e9b4", "#ffffcc"];
        }
        return ["#993404", "#D95F0E", "#F59020", "#F9D48B", "#F9F9D3"];
    }, [viewMode, showMeanValues]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 4 }}>
                <MapControls
                    availableYears={availableYears}
                    availableCommodities={availableCommodities}
                    availablePrograms={availablePrograms}
                    stateCodesData={stateCodesData}
                    selectedCommodities={selectedCommodities}
                    selectedPrograms={selectedPrograms}
                    selectedState={selectedState}
                    viewMode={viewMode}
                    yearRange={yearRange}
                    yearAggregation={yearAggregation}
                    showMeanValues={showMeanValues}
                    proposedPolicyName={proposedPolicyName}
                    setSelectedCommodities={handleSetSelectedCommodities}
                    setSelectedPrograms={handleSetSelectedPrograms}
                    setSelectedState={handleSetSelectedState}
                    setViewMode={handleSetViewMode}
                    setYearRange={setYearRange}
                    setYearAggregation={setYearAggregation}
                    setShowMeanValues={setShowMeanValues}
                    setProposedPolicyName={setProposedPolicyName}
                    aggregationEnabled={aggregationEnabled}
                    setAggregationEnabled={setAggregationEnabled}
                />
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
    );
};

export default CountyCommodityMap;
