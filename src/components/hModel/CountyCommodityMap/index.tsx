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
    isLoading
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

    useEffect(() => {
        setSelectedYear(availableYears[yearRange[0]] || "2024");
    }, [yearRange, availableYears]);
    useEffect(() => {
        const isMeanValueAllowed =
            selectedPrograms.length === 1 &&
            !selectedPrograms.includes("All Programs") &&
            (selectedPrograms[0].includes("ARC") || selectedPrograms[0].includes("PLC"));
        if (showMeanValues && !isMeanValueAllowed) {
            setShowMeanValues(false);
        }
    }, [selectedPrograms, showMeanValues]);
    const mapData = useMemo(() => {
        if (!selectedYear) return { counties: {}, thresholds: [], data: [] };
        return processMapData({
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
        showMeanValues
    ]);
    const mapColor = useMemo(() => {
        if (viewMode === "difference") {
            return ["#8B0000", "#D43D51", "#F7F7F7", "#4E9FD1", "#084594"];
        }
        if (showMeanValues) {
            return ["#2c7fb8", "#41a0c2", "#7fcdbb", "#c7e9b4", "#ffffcc"];
        }
        return ["#993404", "#D95F0E", "#F59020", "#F9D48B", "#F9F9D3"];
    }, [viewMode, showMeanValues]);
    const handleTooltipChange = (content) => {
        setContent(content);
    };
    return (
        <Box sx={{ width: "100%", mb: 5 }}>
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
                setSelectedCommodities={setSelectedCommodities}
                setSelectedPrograms={setSelectedPrograms}
                setSelectedState={setSelectedState}
                setViewMode={setViewMode}
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
            <CountyMap
                key={`${selectedState}-${viewMode}-${selectedCommodities.join('-')}-${selectedPrograms.join('-')}-${selectedYear}`}
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
                setSelectedState={setSelectedState}
            />
        </Box>
    );
};
export default CountyCommodityMap;
