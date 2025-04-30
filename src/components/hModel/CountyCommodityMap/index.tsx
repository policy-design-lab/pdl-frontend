import React, { useState, useEffect, useMemo } from "react";
import { Box, Button } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import MapLegend from "./MapLegend";
import CountyMap from "./CountyMap";
import { processMapData } from "./processMapData";
import MapControls from "./MapControls";
import FilterSelectors from "./FilterSelectors";
import { DistributionType, detectDistributionType } from "../../shared/DistributionFunctions";
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
    const [distributionType, setDistributionType] = useState<DistributionType>("normal");
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
        const resetNavigationState = () => {
            if (isAtTop) {
                setIsAtTop(false);
            }
        };
        return () => {
            resetNavigationState();
        };
    }, [isAtTop]);
    useEffect(() => {
        if (mapData && mapData.data && mapData.data.length > 0 && forceUpdate === 0) {
            const detectedType = detectDistributionType(mapData.data);
            setDistributionType(detectedType);
        }
    }, [mapData?.data]);
    const handleSetSelectedCommodities = (newValue) => {
        if (JSON.stringify(selectedCommodities) !== JSON.stringify(newValue)) {
            setSelectedCommodities(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
            if (onMapUpdate) {
                onMapUpdate(selectedYear, newValue, selectedPrograms, selectedState, viewMode);
            }
        }
    };
    const handleSetSelectedPrograms = (newValue) => {
        if (JSON.stringify(selectedPrograms) !== JSON.stringify(newValue)) {
            setSelectedPrograms(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
            if (onMapUpdate) {
                onMapUpdate(selectedYear, selectedCommodities, newValue, selectedState, viewMode);
            }
        }
    };
    const handleSetSelectedState = (newValue) => {
        if (selectedState !== newValue) {
            setSelectedState(newValue);
            setForceUpdate((prev) => prev + 1);
            setIsAtTop(false);
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
        setIsAtTop(false);
        if (onMapUpdate) {
            onMapUpdate(selectedYear, selectedCommodities, selectedPrograms, selectedState, newValue);
        }
    };
    const handleScrollToTable = () => {
        const tableElement = document.getElementById("county-commodity-table");
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: "smooth" });
            setIsAtTop(true);
        }
    };
    const handleDistributionChange = (newType: DistributionType) => {
        console.log(`Distribution type changed to: ${newType}`);
        setDistributionType(newType);
        setForceUpdate((prev) => prev + 1);
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
            showMeanValues,
            distributionType
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
        distributionType,
        forceUpdate
    ]);
    const mapKey = useMemo(() => {
        return `${selectedCommodities.join("|")}-${selectedPrograms.join(
            "|"
        )}-${selectedState}-${viewMode}-${selectedYear}-${distributionType}-${forceUpdate}`;
    }, [selectedCommodities, selectedPrograms, selectedState, viewMode, selectedYear, distributionType, forceUpdate]);
    const mapColor = useMemo(() => {
        const differenceColors = [
            "#f3e5f5",
            "#e1bee7",
            "#ce93d8",
            "#ba68c8",
            "#9c27b0",
            "#8e24aa",
            "#7b1fa2",
            "#6a1b9a",
            "#4a148c",
            "#380e82",
            "#2a0066"
        ];
        const currentColors = [
            "#fff3e0",
            "#ffe0b2",
            "#ffcc80",
            "#ffb74d",
            "#ffa726",
            "#ff9800",
            "#fb8c00",
            "#f57c00",
            "#e65100",
            "#d84315",
            "#bf360c"
        ];
        const proposedColors = [
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
            "#003966"
        ];
        const meanValueColors = [
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
            "#e65100"
        ];
        const paymentColors = [
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
            "#840000"
        ];
        let baseColors;
        if (viewMode === "difference") {
            baseColors = differenceColors;
        } else if (viewMode === "current") {
            baseColors = currentColors;
        } else if (viewMode === "proposed") {
            baseColors = proposedColors;
        } else if (showMeanValues) {
            baseColors = meanValueColors;
        } else {
            baseColors = paymentColors;
        }
        switch (distributionType) {
            case "leftSkewed":
                return baseColors.slice(0, 10);
            case "rightSkewed":
                return baseColors.slice(0, 10);
            case "normal":
            default:
                return baseColors.slice(0, 10);
        }
    }, [viewMode, showMeanValues, distributionType]);
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
                        yearAggregation={yearAggregation}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                        setViewMode={handleSetViewMode}
                        setYearRange={(newValue) => {
                            setYearRange(newValue);
                            setIsAtTop(false);
                        }}
                        setShowMeanValues={(newValue) => {
                            setShowMeanValues(newValue);
                            setIsAtTop(false);
                        }}
                        setProposedPolicyName={setProposedPolicyName}
                        aggregationEnabled={aggregationEnabled}
                        setAggregationEnabled={(newValue) => {
                            setAggregationEnabled(newValue);
                            setIsAtTop(false);
                        }}
                        setYearAggregation={(newValue) => {
                            setYearAggregation(newValue);
                            setIsAtTop(false);
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
                <Box sx={{ mt: 5 }}>
                    <MapLegend
                        mapData={mapData}
                        mapColor={mapColor}
                        viewMode={viewMode}
                        selectedYear={effectiveYear}
                        selectedState={selectedState}
                        yearAggregation={yearAggregation}
                        showMeanValues={showMeanValues}
                        proposedPolicyName={proposedPolicyName}
                        onDistributionChange={handleDistributionChange}
                        distributionType={distributionType}
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
                    key={mapKey}
                />
            </Box>
            {(() => {
                const hasCommoditySelection =
                    selectedCommodities.length > 0 &&
                    !(selectedCommodities.length === 1 && selectedCommodities[0] === "All Commodities");
                const hasYearSelection = aggregationEnabled && (yearRange.length > 1 || yearAggregation > 0);
                const shouldShowButton = (hasCommoditySelection || hasYearSelection) && !isAtTop;
                if (!shouldShowButton) return null;
                let message = "View detailed breakdown in table";
                const breakdowns: string[] = [];
                if (hasCommoditySelection) breakdowns.push("Commodity breakdown");
                if (hasYearSelection) breakdowns.push("Yearly breakdown");
                if (breakdowns.length > 0) {
                    message += ` (${breakdowns.join(", ")})`;
                }
                return (
                    <div
                        style={{
                            position: "fixed",
                            bottom: "20px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1000
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleScrollToTable}
                            sx={{
                                "backgroundColor": "rgba(47, 113, 100, 0.9)",
                                "&:hover": {
                                    backgroundColor: "rgba(47, 113, 100, 1)"
                                },
                                "display": "flex",
                                "alignItems": "center",
                                "gap": "8px",
                                "padding": "12px 20px",
                                "borderRadius": "8px",
                                "fontWeight": 500
                            }}
                        >
                            <span>{message}</span>
                            <TableChartIcon />
                        </Button>
                    </div>
                );
            })()}
        </Box>
    );
};
export default CountyCommodityMap;
