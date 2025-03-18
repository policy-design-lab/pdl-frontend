import React, { useState, useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import MapLegend from "./MapLegend";
import CountyMap from "./CountyMap";
import { processMapData } from "./processMapData";
import MapControls from "./MapControls";
const debugCountyData = (data, year) => {
    if (!data || !data[year]) {
        console.log("No county data available for year:", year);
        return;
    }
    console.log("County data structure:", {
        year,
        stateCount: data[year].length,
        sampleState: data[year][0],
        stateNames: data[year].map(state => state.stateName || state.stateCode).slice(0, 5),
        georgiaData: data[year].find(state => state.stateCode === "13" || state.stateName === "Georgia")
    });
    const georgiaData = data[year].find(state => state.stateCode === "13" || state.stateName === "Georgia");
    if (georgiaData) {
        console.log("Georgia data found:", {
            stateCode: georgiaData.stateCode,
            counties: georgiaData.counties?.length || 0,
            sampleCounty: georgiaData.counties?.[0]
        });
    } else {
        console.log("Georgia data not found in year:", year);
    }
};
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
        if (availableYears.length > 0) {
            console.log("Available years:", availableYears);
            console.log("State codes:", stateCodesData);
            debugCountyData(countyData, availableYears[0]);
        }
    }, [countyData, availableYears, stateCodesData]);
    useEffect(() => {
        if (selectedState !== "All States") {
            console.log(`State selected: ${selectedState}`);
            const stateCode = Object.entries(stateCodesData)
                .find(([_, name]) => name === selectedState)?.[0];
            if (stateCode) {
                console.log(`State code for ${selectedState}: ${stateCode}`);
            } else {
                console.warn(`Could not find state code for ${selectedState}`);
            }
        }
    }, [selectedState, stateCodesData]);
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
        <Box sx={{ width: "100%" }}>
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