import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, Button, CircularProgress, Backdrop, LinearProgress, Fade } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import MapLegend from "./MapLegend";
import CountyMap from "./CountyMap";
import { processMapData } from "./processMapData";
import MapControls from "./MapControls";
import FilterSelectors from "./FilterSelectors";
import { PercentileMode } from "./percentileConfig";
import {
    isLoadingEnabled,
    isChunkedProcessingEnabled,
    isLoadingOverlayEnabled,
    getHeavyOperationThresholds,
    getChunkSize,
    shouldLogChunkProcessing,
    getUIConfig
} from "../../../utils/configUtil";

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
    setAggregationEnabled,
    stateCodeToName
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
    const [isAtTop, setIsAtTop] = useState(false);
    const [percentileMode, setPercentileMode] = useState(PercentileMode.DEFAULT);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [showTableButton, setShowTableButton] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("Processing data...");
    const [mapData, setMapData] = useState<any>({ counties: {}, thresholds: [], data: [] });

    const prevValuesRef = useRef<{
        selectedYear: string | null;
        selectedYears: string[];
        selectedCommodities: string[];
        selectedPrograms: string[];
        selectedState: string | null;
        viewMode: string | null;
        yearRange: number[];
        aggregationEnabled: boolean;
    }>({
        selectedYear: null,
        selectedYears: [] as string[],
        selectedCommodities: [] as string[],
        selectedPrograms: [] as string[],
        selectedState: null,
        viewMode: null,
        yearRange: [] as number[],
        aggregationEnabled: false
    });

    const processMapDataInChunks = useCallback(async (params) => {
        if (!isLoadingEnabled()) {
            return processMapData(params);
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

            let processedData = { counties: {}, thresholds: [], data: [] };
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
                        const chunkResult = processMapData(chunkParams);
                        if (shouldLogChunkProcessing()) {
                            // eslint-disable-next-line no-console
                            console.log(`Processed chunk ${chunkIndex + 1}/${chunks.length}`, chunkResult);
                        }
                        if (chunkIndex === 0) {
                            processedData = chunkResult;
                        } else {
                            Object.assign(processedData.counties, chunkResult.counties);
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
    }, []);

    const processMapDataAsync = useCallback(
        async (params) => {
            if (!isLoadingEnabled()) {
                return processMapData(params);
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
                        const result = processMapData(params);
                        setIsProcessing(false);
                        resolve(result);
                    } catch (error) {
                        console.error("Error processing map data:", error);
                        setIsProcessing(false);
                        resolve({ counties: {}, thresholds: [], data: [] });
                    }
                };

                if (config.performance.useRequestAnimationFrame) {
                    requestAnimationFrame(processFunction);
                } else {
                    setTimeout(processFunction, 0);
                }
            });
        },
        [processMapDataInChunks]
    );

    const updateMapData = useCallback(async () => {
        if (!selectedYear) {
            setMapData({ counties: {}, thresholds: [], data: [] });
            return;
        }
        const yearsParam = aggregationEnabled ? selectedYears : [selectedYear];
        const params = {
            countyData,
            countyDataProposed,
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
        const result = await processMapDataAsync(params);
        setMapData(result);
    }, [
        countyData,
        countyDataProposed,
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
        forceUpdate,
        processMapDataAsync
    ]);

    useEffect(() => {
        updateMapData();
    }, [updateMapData]);

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
            if (yearRange.length > 1 && !aggregationEnabled) {
                setAggregationEnabled(true);
            } else if (yearRange.length === 1 && aggregationEnabled) {
                setAggregationEnabled(false);
            }

            if (aggregationEnabled && yearRange.length > 0) {
                const selectedYearsList = yearRange.map((index) => availableYears[index] || "2024");
                setSelectedYears(selectedYearsList);
                const latestYearIndex = Math.max(...yearRange);
                setSelectedYear(availableYears[latestYearIndex] || "2024");
            } else {
                const newYear = availableYears[yearRange[0]] || "2024";
                setSelectedYear(newYear);
                setSelectedYears([newYear]);
            }
        }
        return () => {
            mounted = false;
        };
    }, [yearRange, availableYears, aggregationEnabled]);
    useEffect(() => {
        if (!onMapUpdate) return;
        const prevValues = prevValuesRef.current;
        const yearsParam = aggregationEnabled && selectedYears.length > 1 ? selectedYears : selectedYear;
        const yearsChanged = Array.isArray(yearsParam)
            ? JSON.stringify(yearsParam) !== JSON.stringify(prevValues.selectedYears)
            : yearsParam !== prevValues.selectedYear;
        const commoditiesChanged =
            JSON.stringify(selectedCommodities) !== JSON.stringify(prevValues.selectedCommodities);
        const programsChanged = JSON.stringify(selectedPrograms) !== JSON.stringify(prevValues.selectedPrograms);
        const stateChanged = selectedState !== prevValues.selectedState;
        const modeChanged = viewMode !== prevValues.viewMode;
        const rangeChanged = JSON.stringify(yearRange) !== JSON.stringify(prevValues.yearRange);
        const aggregationChanged = aggregationEnabled !== prevValues.aggregationEnabled;
        if (
            yearsChanged ||
            commoditiesChanged ||
            programsChanged ||
            stateChanged ||
            modeChanged ||
            rangeChanged ||
            aggregationChanged
        ) {
            onMapUpdate(yearsParam, selectedCommodities, selectedPrograms, selectedState, viewMode);
            prevValuesRef.current = {
                selectedYear: Array.isArray(yearsParam) ? null : yearsParam,
                selectedYears: Array.isArray(yearsParam) ? yearsParam : [yearsParam],
                selectedCommodities,
                selectedPrograms,
                selectedState,
                viewMode,
                yearRange,
                aggregationEnabled
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
        onMapUpdate
    ]);
    useEffect(() => {
        const resetNavigationState = () => {
            if (isAtTop) {
                setIsAtTop(false);
            }
        };
        return () => {
            resetNavigationState();
        };
    }, [isAtTop]);
    const handleSetSelectedCommodities = (newValue) => {
        if (JSON.stringify(selectedCommodities) !== JSON.stringify(newValue)) {
            setSelectedCommodities(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
            setShowTableButton(true);
        }
    };
    const handleSetSelectedPrograms = (newValue) => {
        if (JSON.stringify(selectedPrograms) !== JSON.stringify(newValue)) {
            setSelectedPrograms(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
            setShowTableButton(true);
        }
    };
    const handleSetSelectedState = (newValue) => {
        if (selectedState !== newValue) {
            setSelectedState(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
            setShowTableButton(true);
        }
    };
    const handleTooltipChange = (newContent) => {
        setContent(newContent);
    };
    const handleSetViewMode = (newValue) => {
        setViewMode(newValue);
        setIsAtTop(false);
        setShowTableButton(true);
    };
    const handleScrollToTable = () => {
        const tableElement = document.getElementById("county-commodity-table");
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: "smooth" });
            setIsAtTop(true);
            setShowTableButton(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const tableElement = document.getElementById("county-commodity-table");
            if (tableElement) {
                const rect = tableElement.getBoundingClientRect();
                const isTableVisible = rect.top < window.innerHeight && rect.bottom > 0;
                setShowTableButton(!isTableVisible);
                if (isTableVisible) {
                    setIsAtTop(true);
                } else {
                    setIsAtTop(false);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);
    const handlePercentileModeChange = (newMode) => {
        if (newMode !== percentileMode) {
            setPercentileMode(newMode);
            setForceUpdate((prev) => prev + 1);
        }
    };
    useEffect(() => {
        if (!mapInitialized && mapData && mapData.thresholds && mapData.thresholds.length > 0) {
            setMapInitialized(true);
        }
    }, [mapData, mapInitialized]);
    const mapKey = useMemo(() => {
        const yearKey =
            aggregationEnabled && selectedYears.length > 1
                ? `years-${selectedYears.join("-")}`
                : `year-${selectedYear}`;
        return `${selectedCommodities.join("|")}-${selectedPrograms.join(
            "|"
        )}-${selectedState}-${viewMode}-${yearKey}-${forceUpdate}`;
    }, [
        selectedCommodities,
        selectedPrograms,
        selectedState,
        viewMode,
        selectedYear,
        selectedYears,
        aggregationEnabled,
        forceUpdate
    ]);

    const mapColor = useMemo(() => {
        if (viewMode === "difference") {
            return [
                "#f3e5f5",
                "#e1bee7",
                "#ce93d8",
                "#ba68c8",
                "#ab47bc",
                "#9c27b0",
                "#8e24aa",
                "#7b1fa2",
                "#6a1b9a",
                "#4a148c",
                "#5c2196"
            ];
        }
        if (viewMode === "current") {
            return [
                "#fff3e0",
                "#ffe0b2",
                "#ffcc80",
                "#ffb74d",
                "#ffa726",
                "#ff9800",
                "#fb8c00",
                "#f57c00",
                "#ef6c00",
                "#e65100",
                "#e05410"
            ];
        }
        if (viewMode === "proposed") {
            return [
                "#e1f5fe",
                "#b3e5fc",
                "#81d4fa",
                "#4fc3f7",
                "#29b6f6",
                "#03a9f4",
                "#039be5",
                "#0288d1",
                "#0277bd",
                "#01579b",
                "#0268a6"
            ];
        }
        if (showMeanValues) {
            return [
                "#fffde7",
                "#fff9c4",
                "#fff59d",
                "#fff176",
                "#ffee58",
                "#ffeb3b",
                "#fdd835",
                "#fbc02d",
                "#f9a825",
                "#f57f17",
                "#f7941d"
            ];
        }
        return [
            "#ffebee",
            "#ffcdd2",
            "#ef9a9a",
            "#e57373",
            "#ef5350",
            "#e53935",
            "#d32f2f",
            "#c62828",
            "#b71c1c",
            "#a51b1b",
            "#c42225"
        ];
    }, [viewMode, showMeanValues]);

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mt: 2, mb: -10 }}>
                <Box
                    sx={{
                        p: 2,
                        backgroundColor: "white",
                        borderRadius: "4px",
                        border: "1px solid rgba(47, 113, 100, 0.2)",
                        mb: 3
                    }}
                >
                    <MapControls
                        availableYears={availableYears}
                        viewMode={viewMode}
                        yearRange={yearRange}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                        setViewMode={handleSetViewMode}
                        setYearRange={(newValue) => {
                            setYearRange(newValue);
                            setIsAtTop(false);
                            setShowTableButton(true);
                        }}
                        setShowMeanValues={(newValue) => {
                            setShowMeanValues(newValue);
                            setIsAtTop(false);
                            setShowTableButton(true);
                        }}
                        setProposedPolicyName={setProposedPolicyName}
                        setAggregationEnabled={(newValue) => {
                            setAggregationEnabled(newValue);
                            setIsAtTop(false);
                            setShowTableButton(true);
                        }}
                        setYearAggregation={(newValue) => {
                            setYearAggregation(newValue);
                            setIsAtTop(false);
                            setShowTableButton(true);
                        }}
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
                <Box sx={{ mt: 5, minHeight: mapInitialized ? 200 : "auto" }}>
                    <MapLegend
                        mapData={mapData}
                        mapColor={mapColor}
                        viewMode={viewMode}
                        selectedYear={aggregationEnabled && selectedYears.length > 1 ? selectedYears : selectedYear}
                        selectedState={selectedState}
                        yearAggregation={yearAggregation}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                        stateCodeToName={stateCodeToName}
                        percentileMode={percentileMode}
                        onPercentileModeChange={handlePercentileModeChange}
                        selectedCommodities={selectedCommodities}
                    />
                </Box>
            </Box>
            <Box
                sx={{
                    overflow: "hidden"
                }}
                id="county-commodity-map"
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
                    selectedYears={aggregationEnabled ? selectedYears : [selectedYear as any]}
                    key={mapKey}
                />
            </Box>
            {(() => {
                const hasCommoditySelection =
                    selectedCommodities.length > 0 &&
                    !(selectedCommodities.length === 1 && selectedCommodities[0] === "All Program Crops");
                const hasYearSelection = aggregationEnabled && (yearRange.length > 1 || yearAggregation > 0);
                const shouldShowButton = (hasCommoditySelection || hasYearSelection) && !isAtTop && showTableButton;
                if (!shouldShowButton) return null;
                let message = "View table";
                const breakdowns: string[] = [];
                if (hasCommoditySelection) breakdowns.push("Commodity");
                if (hasYearSelection) breakdowns.push("Yearly");
                if (breakdowns.length > 0) {
                    message += ` (${breakdowns.join(", ")})`;
                }
                return (
                    <div
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            right: "20px",
                            zIndex: 1000
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleScrollToTable}
                            size="small"
                            sx={{
                                "backgroundColor": "rgba(47, 113, 100, 0.9)",
                                "&:hover": {
                                    backgroundColor: "rgba(47, 113, 100, 1)"
                                },
                                "display": "flex",
                                "alignItems": "center",
                                "gap": "6px",
                                "padding": "8px 12px",
                                "borderRadius": "6px",
                                "fontWeight": 500,
                                "fontSize": "0.875rem",
                                "textTransform": "none"
                            }}
                        >
                            <span>{message}</span>
                            <TableChartIcon sx={{ fontSize: "18px" }} />
                        </Button>
                    </div>
                );
            })()}
            {isLoadingOverlayEnabled() && (
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: 2000,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: getUIConfig().animations.backdropBlur ? "blur(2px)" : "none"
                    }}
                    open={isProcessing}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 2
                        }}
                    >
                        <CircularProgress color="inherit" size={48} thickness={4} />
                        {getUIConfig().animations.enabled && (
                            <Fade in={isProcessing} timeout={getUIConfig().animations.fadeTimeout}>
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        fontSize: "1.1rem",
                                        fontWeight: 500
                                    }}
                                >
                                    {processingMessage}
                                </Box>
                            </Fade>
                        )}
                        {!getUIConfig().animations.enabled && (
                            <Box
                                sx={{
                                    textAlign: "center",
                                    fontSize: "1.1rem",
                                    fontWeight: 500
                                }}
                            >
                                {processingMessage}
                            </Box>
                        )}
                        <LinearProgress
                            sx={{
                                "width": 200,
                                "height": 6,
                                "borderRadius": 3,
                                "backgroundColor": "rgba(255, 255, 255, 0.3)",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#fff",
                                    borderRadius: 3
                                }
                            }}
                        />
                    </Box>
                </Backdrop>
            )}
        </Box>
    );
};
export default CountyCommodityMap;
