import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, CircularProgress, Backdrop } from "@mui/material";
import MapLegend from "../CountyCommodityMap/MapLegend";
import CountyMap from "../CountyCommodityMap/CountyMap";
import CongressionalDistrictMap from "../CongressionalDistrictMap/CongressionalDistrictMap";
import { processMapData } from "../CountyCommodityMap/processMapData";
import { processCongressionalDistrictMapData } from "../CongressionalDistrictMap/processCongressionalDistrictMapData";
import MapControls from "../CountyCommodityMap/MapControls";
import FilterSelectors from "../CountyCommodityMap/FilterSelectors";
import BoundaryToggle, { BoundaryType } from "../BoundaryToggle/BoundaryToggle";
import { PercentileMode } from "../CountyCommodityMap/percentileConfig";
import congressionalDistrictSynthesisData from "../../../data/congressional-districts-synthesis.json";
import {
    isLoadingEnabled,
    isChunkedProcessingEnabled,
    isLoadingOverlayEnabled,
    getHeavyOperationThresholds,
    getChunkSize,
    getUIConfig
} from "../../../utils/configUtil";

interface UnifiedMapContainerProps {
    countyData: Record<string, any>;
    stateCodesData: Record<string, string>;
    countyDataProposed: Record<string, any>;
    allStates: Record<string, unknown>[];
    availableYears: string[];
    availableCommodities: string[];
    availablePrograms: string[];
    isLoading: boolean;
    onMapUpdate: (data: any) => void;
    showMeanValues: boolean;
    setShowMeanValues: (value: boolean) => void;
    yearAggregation: number;
    setYearAggregation: (value: number) => void;
    aggregationEnabled: boolean;
    setAggregationEnabled: (value: boolean) => void;
}

const UnifiedMapContainer: React.FC<UnifiedMapContainerProps> = ({
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
    const [selectedYear, setSelectedYear] = useState(availableYears[availableYears.length - 1] || "2024");
    const [selectedYears, setSelectedYears] = useState(availableYears.slice(0, Math.min(10, availableYears.length)));
    const [selectedCommodities, setSelectedCommodities] = useState(["All Program Crops"]);
    const [selectedPrograms, setSelectedPrograms] = useState(["All Programs"]);
    const [selectedState, setSelectedState] = useState("All States");
    const [viewMode, setViewMode] = useState("current");
    const [proposedPolicyName, setProposedPolicyName] = useState("2025 Policy");
    const [yearRange, setYearRange] = useState(() => {
        const numYears = Math.min(10, availableYears.length);
        return Array.from({ length: numYears }, (_, i) => i);
    });
    const [forceUpdate, setForceUpdate] = useState(0);
    const [isAtTop] = useState(false);
    const [percentileMode, setPercentileMode] = useState(PercentileMode.DEFAULT);
    const [mapInitialized] = useState(false);
    const [showTableButton] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("Processing data...");
    const [mapData, setMapData] = useState<any>({ counties: {}, districts: {}, thresholds: [], data: [] });
    const [boundaryType, setBoundaryType] = useState<BoundaryType>("county");

    const districtData = congressionalDistrictSynthesisData;
    const districtDataProposed = congressionalDistrictSynthesisData;

    const prevValuesRef = useRef<{
        selectedYear: string | null;
        selectedYears: string[];
        selectedCommodities: string[];
        selectedPrograms: string[];
        selectedState: string | null;
        viewMode: string | null;
        yearRange: number[];
        aggregationEnabled: boolean;
        boundaryType: BoundaryType | null;
    }>({
        selectedYear: null,
        selectedYears: [] as string[],
        selectedCommodities: [] as string[],
        selectedPrograms: [] as string[],
        selectedState: null,
        viewMode: null,
        yearRange: [] as number[],
        aggregationEnabled: false,
        boundaryType: null
    });

    const processMapDataInChunks = useCallback(
        async (params) => {
            if (!isLoadingEnabled()) {
                return boundaryType === "county" ? processMapData(params) : processCongressionalDistrictMapData(params);
            }

            setIsProcessing(true);
            setProcessingMessage("Processing map data...");

            return new Promise((resolve) => {
                const chunks = [];
                const years = params.aggregationEnabled ? params.selectedYears : [params.selectedYear];
                const configuredChunkSize = getChunkSize();
                const chunkSize = Math.max(1, Math.floor(years.length / configuredChunkSize));

                for (let i = 0; i < years.length; i += chunkSize) {
                    chunks.push(years.slice(i, i + chunkSize));
                }

                let processedData =
                    boundaryType === "county"
                        ? { counties: {}, thresholds: [], data: [] }
                        : { districts: {}, thresholds: [], data: [] };
                let chunkIndex = 0;

                const processChunk = () => {
                    if (chunkIndex >= chunks.length) {
                        setIsProcessing(false);
                        resolve(processedData);
                        return;
                    }

                    const config = getUIConfig();
                    if (config.loadingStates.enableProgressMessages) {
                        setProcessingMessage(`Processing data... (${chunkIndex + 1}/${chunks.length})`);
                    }

                    const processFunction = () => {
                        try {
                            const chunkParams = { ...params, selectedYears: chunks[chunkIndex] };
                            const chunkResult =
                                boundaryType === "county"
                                    ? processMapData(chunkParams)
                                    : processCongressionalDistrictMapData(chunkParams);

                            if (chunkIndex === 0) {
                                processedData = chunkResult;
                            } else {
                                if (boundaryType === "county") {
                                    Object.assign(processedData.counties, chunkResult.counties);
                                } else {
                                    Object.assign(processedData.districts, chunkResult.districts);
                                }
                                processedData.data = [...processedData.data, ...chunkResult.data];
                                processedData.thresholds = chunkResult.thresholds;
                            }
                            chunkIndex += 1;
                            setTimeout(processChunk, 0);
                        } catch (error) {
                            console.error("Error processing chunk:", error);
                            chunkIndex += 1;
                            setTimeout(processChunk, 0);
                        }
                    };

                    if (config.performance.useRequestAnimationFrame) {
                        requestAnimationFrame(processFunction);
                    } else {
                        setTimeout(processFunction, 0);
                    }
                };

                processChunk();
            });
        },
        [boundaryType]
    );

    const processMapDataAsync = useCallback(
        async (params) => {
            if (!isLoadingEnabled()) {
                return boundaryType === "county" ? processMapData(params) : processCongressionalDistrictMapData(params);
            }
            const thresholds = getHeavyOperationThresholds();
            const hasMultipleYears =
                params.aggregationEnabled && params.selectedYears.length > thresholds.multipleYears;
            const hasComplexFilters =
                params.selectedCommodities.length > thresholds.complexCommodityFilters ||
                params.selectedPrograms.length > thresholds.complexProgramFilters;
            const shouldUseChunking =
                isChunkedProcessingEnabled() && (hasMultipleYears || hasComplexFilters) && !params.aggregationEnabled;

            if (shouldUseChunking) {
                return processMapDataInChunks(params);
            }
            setIsProcessing(true);
            setProcessingMessage("Processing map data...");

            return new Promise((resolve) => {
                const config = getUIConfig();
                const processFunction = () => {
                    try {
                        const result =
                            boundaryType === "county"
                                ? processMapData(params)
                                : processCongressionalDistrictMapData(params);
                        setIsProcessing(false);
                        resolve(result);
                    } catch (error) {
                        console.error("Error processing map data:", error);
                        setIsProcessing(false);
                        resolve(
                            boundaryType === "county"
                                ? { counties: {}, thresholds: [], data: [] }
                                : { districts: {}, thresholds: [], data: [] }
                        );
                    }
                };

                if (config.performance.useRequestAnimationFrame) {
                    requestAnimationFrame(processFunction);
                } else {
                    setTimeout(processFunction, 0);
                }
            });
        },
        [processMapDataInChunks, boundaryType]
    );

    const updateMapData = useCallback(async () => {
        if (!selectedYear) {
            setMapData(
                boundaryType === "county"
                    ? { counties: {}, thresholds: [], data: [] }
                    : { districts: {}, thresholds: [], data: [] }
            );
            return;
        }
        const yearsParam = aggregationEnabled ? selectedYears : [selectedYear];
        const params = {
            countyData: boundaryType === "county" ? countyData : undefined,
            countyDataProposed: boundaryType === "county" ? countyDataProposed : undefined,
            districtData: boundaryType === "congressional-district" ? districtData : undefined,
            districtDataProposed: boundaryType === "congressional-district" ? districtDataProposed : undefined,
            selectedYear,
            selectedYears: yearsParam,
            viewMode,
            selectedCommodities,
            selectedPrograms,
            selectedState,
            stateCodesData,
            yearAggregation,
            aggregationEnabled,
            showMeanValues,
            percentileMode
        };

        try {
            const result = await processMapDataAsync(params);
            setMapData(result);
            setMapInitialized(true);
            if (onMapUpdate) {
                onMapUpdate(result);
            }
        } catch (error) {
            console.error("Error updating map data:", error);
            setMapData(
                boundaryType === "county"
                    ? { counties: {}, thresholds: [], data: [] }
                    : { districts: {}, thresholds: [], data: [] }
            );
        }
    }, [
        countyData,
        countyDataProposed,
        districtData,
        districtDataProposed,
        selectedYear,
        selectedYears,
        viewMode,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        stateCodesData,
        yearAggregation,
        aggregationEnabled,
        showMeanValues,
        percentileMode,
        processMapDataAsync,
        onMapUpdate,
        boundaryType
    ]);

    useEffect(() => {
        const prevValues = prevValuesRef.current;
        const hasChanged =
            prevValues.selectedYear !== selectedYear ||
            JSON.stringify(prevValues.selectedYears) !== JSON.stringify(selectedYears) ||
            JSON.stringify(prevValues.selectedCommodities) !== JSON.stringify(selectedCommodities) ||
            JSON.stringify(prevValues.selectedPrograms) !== JSON.stringify(selectedPrograms) ||
            prevValues.selectedState !== selectedState ||
            prevValues.viewMode !== viewMode ||
            JSON.stringify(prevValues.yearRange) !== JSON.stringify(yearRange) ||
            prevValues.aggregationEnabled !== aggregationEnabled ||
            prevValues.boundaryType !== boundaryType;

        if (hasChanged) {
            updateMapData();
            prevValuesRef.current = {
                selectedYear,
                selectedYears: [...selectedYears],
                selectedCommodities: [...selectedCommodities],
                selectedPrograms: [...selectedPrograms],
                selectedState,
                viewMode,
                yearRange: [...yearRange],
                aggregationEnabled,
                boundaryType
            };
        }
    }, [
        selectedYear,
        selectedYears,
        selectedCommodities,
        selectedPrograms,
        selectedState,
        viewMode,
        yearRange,
        aggregationEnabled,
        boundaryType,
        updateMapData
    ]);

    const handleBoundaryChange = useCallback((newBoundaryType: BoundaryType) => {
        setBoundaryType(newBoundaryType);
        setMapData(
            newBoundaryType === "county"
                ? { counties: {}, thresholds: [], data: [] }
                : { districts: {}, thresholds: [], data: [] }
        );
    }, []);

    const handleTooltipChange = (newContent: string) => {
        setContent(newContent);
    };

    const mapColor = [
        "#f7fbff",
        "#deebf7",
        "#c6dbef",
        "#9ecae1",
        "#6baed6",
        "#4292c6",
        "#2171b5",
        "#08519c",
        "#08306b"
    ];

    return (
        <Box sx={{ width: "100%", position: "relative" }}>
            {(isProcessing || isLoading) && isLoadingOverlayEnabled() && (
                <Backdrop open style={{ zIndex: 1300, color: "#fff" }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <CircularProgress color="inherit" />
                        <Box mt={2}>{processingMessage}</Box>
                    </Box>
                </Backdrop>
            )}
            <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                <BoundaryToggle
                    selectedBoundary={boundaryType}
                    onBoundaryChange={handleBoundaryChange}
                    disabled={isLoading || isProcessing}
                />
            </Box>
            <FilterSelectors
                availableYears={availableYears}
                availableCommodities={availableCommodities}
                availablePrograms={availablePrograms}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedYears={selectedYears}
                setSelectedYears={setSelectedYears}
                selectedCommodities={selectedCommodities}
                setSelectedCommodities={setSelectedCommodities}
                selectedPrograms={selectedPrograms}
                setSelectedPrograms={setSelectedPrograms}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                allStates={allStates}
                stateCodesData={stateCodesData}
                viewMode={viewMode}
                setViewMode={setViewMode}
                proposedPolicyName={proposedPolicyName}
                setProposedPolicyName={setProposedPolicyName}
                yearRange={yearRange}
                setYearRange={setYearRange}
                showMeanValues={showMeanValues}
                setShowMeanValues={setShowMeanValues}
                yearAggregation={yearAggregation}
                setYearAggregation={setYearAggregation}
                aggregationEnabled={aggregationEnabled}
                setAggregationEnabled={setAggregationEnabled}
                forceUpdate={forceUpdate}
                setForceUpdate={setForceUpdate}
            />
            <MapControls
                percentileMode={percentileMode}
                setPercentileMode={setPercentileMode}
                isAtTop={isAtTop}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                showTableButton={showTableButton}
            />
            <Box id={boundaryType === "county" ? "county-commodity-map" : "congressional-district-map"} sx={{ mb: 2 }}>
                {boundaryType === "county" ? (
                    <CountyMap
                        mapData={mapData}
                        mapColor={mapColor}
                        viewMode={viewMode}
                        selectedState={selectedState}
                        stateCodesData={stateCodesData}
                        allStates={allStates}
                        isLoading={isLoading || isProcessing}
                        onTooltipChange={handleTooltipChange}
                        tooltipContent={content}
                        showMeanValues={showMeanValues}
                        selectedPrograms={selectedPrograms}
                        yearAggregation={yearAggregation}
                        selectedCommodities={selectedCommodities}
                        setSelectedState={setSelectedState}
                        selectedYears={selectedYears}
                    />
                ) : (
                    <CongressionalDistrictMap
                        mapData={mapData}
                        mapColor={mapColor}
                        viewMode={viewMode}
                        selectedState={selectedState}
                        stateCodesData={stateCodesData}
                        allStates={allStates}
                        isLoading={isLoading || isProcessing}
                        onTooltipChange={handleTooltipChange}
                        tooltipContent={content}
                        showMeanValues={showMeanValues}
                        selectedPrograms={selectedPrograms}
                        yearAggregation={yearAggregation}
                        selectedCommodities={selectedCommodities}
                        setSelectedState={setSelectedState}
                        selectedYears={selectedYears}
                    />
                )}
            </Box>
            <MapLegend
                mapColor={mapColor}
                thresholds={mapData.thresholds || []}
                viewMode={viewMode}
                showMeanValues={showMeanValues}
            />
        </Box>
    );
};

export default UnifiedMapContainer;
