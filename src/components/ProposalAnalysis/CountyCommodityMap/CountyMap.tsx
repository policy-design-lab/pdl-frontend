import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Box, CircularProgress, Button } from "@mui/material";
import { ComposableMap, Geographies, ZoomableGroup } from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import { CountyTooltipContent } from "./CountyTooltipContent";
import { useStyles, tooltipBkgColor } from "../../shared/MapTooltip";
import { CountyGeographyLayer, StateBoundaryLayer, StateLabelLayer } from "../../shared/countyMap/CountyMapLayers";
import {
    COUNTY_TOPOJSON_URL,
    STATE_TOPOJSON_URL,
    STATE_ABBR_TO_FIPS,
    getCountyMapPosition,
    getStateFipsFromName,
    getStateViewport
} from "../../../utils/countyGeo";

const findCountyData = (counties, countyFIPS) => {
    if (!countyFIPS) return { countyData: null, usedKey: null };
    const countyData = counties[countyFIPS];
    const usedKey = countyFIPS;
    if (countyData) {
        let hasRealData = false;
        if (countyData.value && parseFloat(countyData.value) > 0) {
            hasRealData = true;
        } else if (countyData.commodities && Object.keys(countyData.commodities).length > 0) {
            Object.values(countyData.commodities).forEach((commodity: any) => {
                if (commodity.value && parseFloat(commodity.value) > 0) {
                    hasRealData = true;
                }
            });
        }
        if (!hasRealData) {
            countyData.hasData = false;
        }
    }
    return { countyData, usedKey };
};
const CountyMap = ({
    mapData,
    mapColor,
    viewMode,
    selectedState,
    stateCodesData,
    allStates,
    isLoading,
    onTooltipChange,
    tooltipContent,
    showMeanValues,
    selectedPrograms,
    yearAggregation,
    selectedCommodities,
    setSelectedState,
    selectedYears = []
}: {
    mapData: Record<string, unknown>;
    mapColor: string[];
    viewMode: string;
    selectedState: string;
    stateCodesData: Record<string, string>;
    allStates: Record<string, unknown>[];
    isLoading: boolean;
    onTooltipChange: (content: string) => void;
    tooltipContent: string;
    showMeanValues: boolean;
    selectedPrograms: string[];
    yearAggregation: number;
    selectedCommodities: string[];
    setSelectedState: (state: string) => void;
    selectedYears: (string | number)[];
}): JSX.Element => {
    const classes = useStyles();
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);
    const [position, setPosition] = useState(getCountyMapPosition("All States", 1));
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    const mountedRef = useRef(true);
    const resolvedStateCodes = useMemo(() => {
        const mapped: Record<string, string> = { ...stateCodesData };
        Object.entries(stateCodesData).forEach(([code, name]) => {
            const upperCode = code.toUpperCase();
            if (/^[A-Z]{2}$/.test(upperCode)) {
                const stateFips = STATE_ABBR_TO_FIPS[upperCode];
                if (stateFips && !mapped[stateFips]) {
                    mapped[stateFips] = name;
                }
            }
        });
        return mapped;
    }, [stateCodesData]);
    const selectedStateFips = selectedState === "All States" ? null : getStateFipsFromName(selectedState);
    const stateAbbrevByVal = useMemo(() => {
        const mapped: Record<string, string> = {};
        allStates.forEach((state: any) => {
            if (state?.val !== undefined && state?.id) {
                mapped[String(state.val)] = String(state.id);
            }
        });
        return mapped;
    }, [allStates]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const handleDoubleClick = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".county-commodity-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        const handleWheel = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".county-commodity-map")) {
                if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaZ !== 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }
            return undefined;
        };
        const handleDrag = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".county-commodity-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        const handleClick = (e: any): boolean | undefined => {
            if (
                e.target?.closest?.(".county-commodity-map") &&
                !e.target?.closest?.(".rsm-geography") &&
                !e.target?.closest?.("button") &&
                !e.target?.closest?.(".MuiButton-root")
            ) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        const handleMouseDown = (e: any): boolean | undefined => {
            if (
                e.target?.closest?.(".county-commodity-map") &&
                !e.target?.closest?.(".rsm-geography") &&
                !e.target?.closest?.("button") &&
                !e.target?.closest?.(".MuiButton-root")
            ) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        document.addEventListener("dblclick", handleDoubleClick, { capture: true });
        document.addEventListener("wheel", handleWheel, { capture: true, passive: false });
        document.addEventListener("drag", handleDrag, { capture: true });
        document.addEventListener("dragstart", handleDrag, { capture: true });
        document.addEventListener("mousedown", handleMouseDown, { capture: true });
        document.addEventListener("click", handleClick, { capture: true });
        return () => {
            document.removeEventListener("dblclick", handleDoubleClick, { capture: true });
            document.removeEventListener("wheel", handleWheel, { capture: true });
            document.removeEventListener("drag", handleDrag, { capture: true });
            document.removeEventListener("dragstart", handleDrag, { capture: true });
            document.removeEventListener("mousedown", handleMouseDown, { capture: true });
            document.removeEventListener("click", handleClick, { capture: true });
        };
    }, []);

    useEffect(() => {
        setPosition(getCountyMapPosition(selectedState, userZoomLevel));
    }, [selectedState, userZoomLevel]);

    const handleZoomIn = useCallback(() => {
        if (!mountedRef.current) return;
        const newZoomLevel = Math.min(userZoomLevel * 1.2, 3);
        setUserZoomLevel(newZoomLevel);
    }, [userZoomLevel]);

    const handleZoomOut = useCallback(() => {
        if (!mountedRef.current) return;
        const newZoomLevel = Math.max(userZoomLevel / 1.2, 0.5);
        setUserZoomLevel(newZoomLevel);
    }, [userZoomLevel]);

    const handleResetZoom = useCallback(() => {
        if (!mountedRef.current) return;
        setUserZoomLevel(1);
        setPosition(getCountyMapPosition(selectedState, 1));
    }, [selectedState]);

    const handleMouseEnter = useCallback(
        (geo: any, countyFIPS?: string) => {
            let localCountyFIPS = countyFIPS;
            if (!localCountyFIPS && geo.properties) {
                if ((geo.properties as any).geoid) {
                    localCountyFIPS = (geo.properties as any).geoid;
                } else if ((geo.properties as any).fips) {
                    localCountyFIPS = (geo.properties as any).fips;
                }
            }
            const countyName = (geo.properties as any)?.name || "Unknown County";
            const lookupFIPS = localCountyFIPS;
            const { countyData } = findCountyData(mapData.counties, lookupFIPS || "");
            if (!countyData) {
                const mockCountyData = {
                    hasData: false,
                    name: countyName
                };
                const tooltipHtml = CountyTooltipContent({
                    countyData: mockCountyData,
                    countyFIPS: localCountyFIPS || "",
                    viewMode,
                    selectedCommodities,
                    selectedPrograms,
                    classes,
                    showMeanValues,
                    yearAggregation,
                    selectedYears,
                    stateCodesData: resolvedStateCodes
                });
                if (mountedRef.current) {
                    onTooltipChange(tooltipHtml);
                }
                return undefined;
            }
            const tooltipHtml = CountyTooltipContent({
                countyData,
                countyFIPS: localCountyFIPS || "",
                viewMode,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                yearAggregation,
                selectedYears,
                stateCodesData: resolvedStateCodes
            });
            if (mountedRef.current) {
                onTooltipChange(tooltipHtml);
            }
            return undefined;
        },
        [
            mapData,
            onTooltipChange,
            selectedCommodities,
            selectedPrograms,
            classes,
            showMeanValues,
            viewMode,
            yearAggregation,
            resolvedStateCodes
        ]
    );
    const handleMouseLeave = useCallback(() => {
        if (mountedRef.current) {
            onTooltipChange("");
        }
    }, [onTooltipChange]);
    const handleCloseStateView = useCallback(() => {
        if (mountedRef.current) {
            setSelectedState("All States");
            setUserZoomLevel(1);
            setPosition(getCountyMapPosition("All States", 1));
        }
    }, [setSelectedState]);
    const handleMoveEnd = useCallback(
        (positionObj: { coordinates: number[]; zoom: number }): undefined => {
            if (!mountedRef.current) return;

            if (selectedState === "All States") {
                const allStatesPosition = getCountyMapPosition("All States", 1);
                const [allStatesLon, allStatesLat] = allStatesPosition.coordinates;
                if (positionObj.coordinates[0] !== allStatesLon || positionObj.coordinates[1] !== allStatesLat) {
                    setPosition({ coordinates: allStatesPosition.coordinates, zoom: positionObj.zoom });
                }
            } else {
                const stateView = getStateViewport(selectedState);
                if (stateView) {
                    const [centerLon, centerLat] = stateView.center;
                    if (positionObj.coordinates[0] !== centerLon || positionObj.coordinates[1] !== centerLat) {
                        setPosition({ coordinates: stateView.center, zoom: positionObj.zoom });
                    }
                }
            }
        },
        [selectedState]
    );
    const getCountyFillColor = useCallback(
        (countyData) => {
            if (!countyData || countyData.hasData === false) return "#EEE";
            if (showMeanValues && (!countyData.hasValidBaseAcres || countyData.baseAcres <= 0)) {
                return "#CCC";
            }
            let valueToUse;
            if (showMeanValues) {
                if (viewMode === "difference") {
                    const currentBaseAcres = countyData.currentBaseAcres || 0;
                    const proposedBaseAcres = countyData.proposedBaseAcres || 0;
                    const currentRate = currentBaseAcres > 0 ? (countyData.currentValue || 0) / currentBaseAcres : 0;
                    const proposedRate =
                        proposedBaseAcres > 0 ? (countyData.proposedValue || 0) / proposedBaseAcres : 0;
                    valueToUse = proposedRate - currentRate;
                } else {
                    const totalPayment = viewMode === "proposed" ? countyData.proposedValue : countyData.currentValue;
                    const baseAcres =
                        viewMode === "proposed" ? countyData.proposedBaseAcres : countyData.currentBaseAcres;
                    valueToUse = baseAcres > 0 ? totalPayment / baseAcres : 0;
                    if ((valueToUse === undefined || valueToUse === 0) && selectedPrograms.length === 1) {
                        const programName = selectedPrograms[0];
                        if (countyData.programs && countyData.programs[programName]) {
                            const programValue =
                                viewMode === "proposed"
                                    ? countyData.programs[programName].proposedValue
                                    : countyData.programs[programName].currentValue;
                            const programBaseAcres =
                                viewMode === "proposed"
                                    ? countyData.programs[programName].proposedBaseAcres
                                    : countyData.programs[programName].currentBaseAcres;
                            valueToUse = programBaseAcres > 0 ? programValue / programBaseAcres : 0;
                        }
                    }
                }
            } else {
                valueToUse = countyData.value || 0;
            }
            if (valueToUse === undefined || valueToUse === null || !Number.isFinite(valueToUse) || valueToUse < 0.01) {
                return "#EEE";
            }
            return colorScale(valueToUse);
        },
        [showMeanValues, selectedPrograms, viewMode, colorScale]
    );
    const getCountyFillColorByFips = useCallback(
        (countyFIPS: string) => {
            const { countyData } = findCountyData(mapData.counties, countyFIPS);
            if (!countyData || countyData.hasData === false) {
                return "#d9d9d9";
            }
            return getCountyFillColor(countyData);
        },
        [mapData, getCountyFillColor]
    );
    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box
            className="county-commodity-map"
            sx={{
                position: "relative",
                transition: "opacity 0.3s ease-in-out",
                opacity: isLoading ? 0.6 : 1
            }}
        >
            {selectedState !== "All States" && (
                <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2000 }}>
                    <Button
                        onClick={handleCloseStateView}
                        aria-label="return to US map"
                        variant="contained"
                        startIcon={<CloseIcon />}
                        sx={{
                            "bgcolor": "rgba(47, 113, 100, 0.9)",
                            "color": "white",
                            "border": "2px solid white",
                            "boxShadow": "0 2px 10px rgba(0,0,0,0.2)",
                            "pointerEvents": "auto",
                            "@keyframes pulse": {
                                "0%": {
                                    boxShadow: "0 0 0 0 rgba(47, 113, 100, 0.7)"
                                },
                                "70%": {
                                    boxShadow: "0 0 0 8px rgba(47, 113, 100, 0)"
                                },
                                "100%": {
                                    boxShadow: "0 0 0 0 rgba(47, 113, 100, 0)"
                                }
                            },
                            "animation": "pulse 2s infinite",
                            "&:hover": {
                                bgcolor: "rgba(47, 113, 100, 1)",
                                transform: "scale(1.05)"
                            }
                        }}
                    >
                        Return to US Map
                    </Button>
                </Box>
            )}
            <Box
                sx={{
                    "width": "100%",
                    "position": "relative",
                    "& .rsm-geography": {
                        pointerEvents: "visiblePainted",
                        cursor: "default !important"
                    },
                    "& .rsm-zoomable-group": {
                        pointerEvents: "none !important"
                    },
                    "& .rsm-svg": {
                        pointerEvents: "none !important"
                    }
                }}
            >
                <div
                    data-tip=""
                    data-for="map-tooltip"
                    style={{
                        width: "100%",
                        position: "relative",
                        transform: `scale(${Math.min(1, window.devicePixelRatio || 1)})`,
                        transformOrigin: "center center"
                    }}
                >
                    <ComposableMap
                        data-tip=""
                        projection="geoAlbersUsa"
                        className="county-commodity-map"
                        style={{
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none"
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }}
                        onMouseMove={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onMouseUp={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }}
                        onDrag={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }}
                    >
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMoveEnd}
                            doubleclickzoom="false"
                            disablepanning="true"
                            minZoom={0.5}
                            maxZoom={3}
                        >
                            <Geographies geography={COUNTY_TOPOJSON_URL}>
                                {({ geographies }) => (
                                    <CountyGeographyLayer
                                        geographies={geographies}
                                        selectedStateFips={selectedStateFips}
                                        getCountyFillColor={getCountyFillColorByFips}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        defaultStyle={{ outline: "none", pointerEvents: "auto" }}
                                        hoverStyle={{
                                            stroke: "#232323",
                                            strokeWidth: 0.5,
                                            outline: "none",
                                            pointerEvents: "auto"
                                        }}
                                        pressedStyle={{
                                            outline: "none",
                                            stroke: "#FFFFFF",
                                            strokeWidth: 0.15,
                                            pointerEvents: "auto"
                                        }}
                                    />
                                )}
                            </Geographies>
                            <Geographies geography={STATE_TOPOJSON_URL}>
                                {({ geographies }) => (
                                    <>
                                        <StateBoundaryLayer geographies={geographies} />
                                        <StateLabelLayer
                                            geographies={geographies}
                                            selectedState={selectedState}
                                            stateAbbrevByVal={stateAbbrevByVal}
                                        />
                                    </>
                                )}
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                </div>
                <ReactTooltip
                    className={`${classes.customized_tooltip} tooltip`}
                    backgroundColor={tooltipBkgColor}
                    effect="float"
                    html
                    id="map-tooltip"
                    clickable={false}
                    getContent={() => tooltipContent}
                    offset={{ top: 5, left: 5 }}
                    place="right"
                >
                    {tooltipContent}
                </ReactTooltip>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    zIndex: 500,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                    pointerEvents: "auto"
                }}
            >
                <Box
                    sx={{
                        fontSize: "11px",
                        color: "#666",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        pointerEvents: "auto",
                        textAlign: "center",
                        maxWidth: "180px"
                    }}
                    title="Use these buttons to zoom instead of mouse scroll to avoid accidental zoom changes"
                >
                    Map Zoom Controls
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "8px",
                        padding: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        pointerEvents: "auto"
                    }}
                >
                    <Button
                        onClick={handleZoomOut}
                        size="small"
                        variant="outlined"
                        sx={{
                            "minWidth": "auto",
                            "width": "32px",
                            "height": "32px",
                            "borderColor": "rgba(47, 113, 100, 0.5)",
                            "color": "#2F7164",
                            "pointerEvents": "auto",
                            "&:hover": {
                                borderColor: "#2F7164",
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
                            }
                        }}
                    >
                        −
                    </Button>
                    <Button
                        onClick={handleResetZoom}
                        size="small"
                        variant="outlined"
                        sx={{
                            "fontSize": "11px",
                            "borderColor": "rgba(47, 113, 100, 0.5)",
                            "color": "#2F7164",
                            "pointerEvents": "auto",
                            "&:hover": {
                                borderColor: "#2F7164",
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
                            }
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={handleZoomIn}
                        size="small"
                        variant="outlined"
                        sx={{
                            "minWidth": "auto",
                            "width": "32px",
                            "height": "32px",
                            "borderColor": "rgba(47, 113, 100, 0.5)",
                            "color": "#2F7164",
                            "pointerEvents": "auto",
                            "&:hover": {
                                borderColor: "#2F7164",
                                backgroundColor: "rgba(47, 113, 100, 0.1)"
                            }
                        }}
                    >
                        +
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
export default CountyMap;
