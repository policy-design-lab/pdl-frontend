import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, IconButton, Button } from "@mui/material";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import { CountyTooltipContent } from "./CountyTooltipContent";
import { useStyles, tooltipBkgColor } from "../../shared/MapTooltip";

const geoCountyUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";
const geoStateUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const stateViewSettings = {
    "Alabama": { center: [-86.8, 32.7], zoom: 5 },
    "Alaska": { center: [-150, 63], zoom: 3 },
    "Arizona": { center: [-111.5, 34.5], zoom: 4.5 },
    "Arkansas": { center: [-92.5, 35], zoom: 5 },
    "California": { center: [-119, 37], zoom: 4 },
    "Colorado": { center: [-105.5, 39], zoom: 5 },
    "Connecticut": { center: [-72.7, 41.5], zoom: 7 },
    "Delaware": { center: [-75.5, 39], zoom: 7 },
    "Florida": { center: [-83, 28], zoom: 5 },
    "Georgia": { center: [-83.5, 32.5], zoom: 5 },
    "Hawaii": { center: [-157, 20], zoom: 6 },
    "Idaho": { center: [-114, 44.5], zoom: 5 },
    "Illinois": { center: [-89, 40], zoom: 5 },
    "Indiana": { center: [-86, 40], zoom: 5 },
    "Iowa": { center: [-93.5, 42], zoom: 5 },
    "Kansas": { center: [-98, 38.5], zoom: 5 },
    "Kentucky": { center: [-85, 37.5], zoom: 5 },
    "Louisiana": { center: [-92, 31], zoom: 5 },
    "Maine": { center: [-69, 45], zoom: 5 },
    "Maryland": { center: [-77, 39], zoom: 6 },
    "Massachusetts": { center: [-71.5, 42], zoom: 6 },
    "Michigan": { center: [-85, 44.5], zoom: 5 },
    "Minnesota": { center: [-94, 46], zoom: 5 },
    "Mississippi": { center: [-89.5, 33], zoom: 5 },
    "Missouri": { center: [-92.5, 38.5], zoom: 5 },
    "Montana": { center: [-110, 47], zoom: 5 },
    "Nebraska": { center: [-99.5, 41.5], zoom: 5 },
    "Nevada": { center: [-117, 39], zoom: 5 },
    "New Hampshire": { center: [-71.5, 43.5], zoom: 6 },
    "New Jersey": { center: [-74.5, 40], zoom: 6 },
    "New Mexico": { center: [-106, 34], zoom: 5 },
    "New York": { center: [-75.5, 43], zoom: 5 },
    "North Carolina": { center: [-79.5, 35.5], zoom: 5 },
    "North Dakota": { center: [-100.5, 47.5], zoom: 5 },
    "Ohio": { center: [-82.5, 40], zoom: 5 },
    "Oklahoma": { center: [-97, 35.5], zoom: 5 },
    "Oregon": { center: [-120.5, 44], zoom: 5 },
    "Pennsylvania": { center: [-77.5, 41], zoom: 5 },
    "Rhode Island": { center: [-71.5, 41.5], zoom: 7 },
    "South Carolina": { center: [-81, 34], zoom: 5 },
    "South Dakota": { center: [-100, 44.5], zoom: 5 },
    "Tennessee": { center: [-86, 36], zoom: 5 },
    "Texas": { center: [-99, 31], zoom: 4 },
    "Utah": { center: [-111.5, 39.5], zoom: 5 },
    "Vermont": { center: [-72.5, 44], zoom: 6 },
    "Virginia": { center: [-79, 37.5], zoom: 5 },
    "Washington": { center: [-120.5, 47.5], zoom: 5 },
    "West Virginia": { center: [-80.5, 39], zoom: 5 },
    "Wisconsin": { center: [-89.5, 44.5], zoom: 5 },
    "Wyoming": { center: [-107.5, 43], zoom: 5 },
    "District of Columbia": { center: [-77, 38.9], zoom: 9 }
};
const findCountyData = (counties, countyFIPS, debug = false) => {
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
    mapData: any;
    mapColor: string[];
    viewMode: string;
    selectedState: string;
    stateCodesData: any;
    allStates: any;
    isLoading: boolean;
    onTooltipChange: (content: string) => void;
    tooltipContent: string;
    showMeanValues: boolean;
    selectedPrograms: string[];
    yearAggregation: number;
    selectedCommodities: string[];
    setSelectedState: (state: string) => void;
    selectedYears: (string | number)[];
}) => {
    const classes = useStyles();
    const colorScale = d3.scaleThreshold().domain(mapData.thresholds).range(mapColor);
    const [position, setPosition] = useState({ coordinates: [-95, 40], zoom: 1 });
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    useEffect(() => {
        const handleDoubleClick = (e) => {
            if (e.target.closest(".county-commodity-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        };
        const handleWheel = (e) => {
            if (e.target.closest(".county-commodity-map")) {
                if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaZ !== 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }
        };
        const handleDrag = (e) => {
            if (e.target.closest(".county-commodity-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        };
        const handleClick = (e) => {
            if (
                e.target.closest(".county-commodity-map") &&
                !e.target.closest(".rsm-geography") &&
                !e.target.closest("button") &&
                !e.target.closest(".MuiButton-root")
            ) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
        };
        const handleMouseDown = (e) => {
            if (
                e.target.closest(".county-commodity-map") &&
                !e.target.closest(".rsm-geography") &&
                !e.target.closest("button") &&
                !e.target.closest(".MuiButton-root")
            ) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
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
        let mounted = true;
        if (Object.keys(stateCodesData).length > 0) {
            Object.entries(stateCodesData).forEach(([code, name]) => {
                if (!mounted) return;
                if (code.length === 2 && /^[A-Z]{2}$/.test(code)) {
                    const numericCodeMap = {
                        AL: "01",
                        AK: "02",
                        AZ: "04",
                        AR: "05",
                        CA: "06",
                        CO: "08",
                        CT: "09",
                        DE: "10",
                        FL: "12",
                        GA: "13",
                        HI: "15",
                        ID: "16",
                        IL: "17",
                        IN: "18",
                        IA: "19",
                        KS: "20",
                        KY: "21",
                        LA: "22",
                        ME: "23",
                        MD: "24",
                        MA: "25",
                        MI: "26",
                        MN: "27",
                        MS: "28",
                        MO: "29",
                        MT: "30",
                        NE: "31",
                        NV: "32",
                        NH: "33",
                        NJ: "34",
                        NM: "35",
                        NY: "36",
                        NC: "37",
                        ND: "38",
                        OH: "39",
                        OK: "40",
                        OR: "41",
                        PA: "42",
                        RI: "44",
                        SC: "45",
                        SD: "46",
                        TN: "47",
                        TX: "48",
                        UT: "49",
                        VT: "50",
                        VA: "51",
                        WA: "53",
                        WV: "54",
                        WI: "55",
                        WY: "56",
                        DC: "11"
                    };
                    if (numericCodeMap[code] && !stateCodesData[numericCodeMap[code]]) {
                        stateCodesData[numericCodeMap[code]] = name;
                    }
                }
            });
        }
        if (mounted) {
            if (selectedState === "All States") {
                setPosition({ coordinates: [-95, 40], zoom: userZoomLevel });
            } else if (stateViewSettings[selectedState]) {
                const { center, zoom } = stateViewSettings[selectedState];
                setPosition({ coordinates: center, zoom: zoom * userZoomLevel });
            }
        }
        return () => {
            mounted = false;
        };
    }, [selectedState, mapData, stateCodesData, userZoomLevel]);

    const handleZoomIn = useCallback(() => {
        const newZoomLevel = Math.min(userZoomLevel * 1.2, 3);
        setUserZoomLevel(newZoomLevel);
        if (selectedState === "All States") {
            setPosition({ coordinates: [-95, 40], zoom: newZoomLevel });
        } else if (stateViewSettings[selectedState]) {
            const { center } = stateViewSettings[selectedState];
            setPosition({ coordinates: center, zoom: stateViewSettings[selectedState].zoom * newZoomLevel });
        }
    }, [userZoomLevel, selectedState]);

    const handleZoomOut = useCallback(() => {
        const newZoomLevel = Math.max(userZoomLevel / 1.2, 0.5);
        setUserZoomLevel(newZoomLevel);
        if (selectedState === "All States") {
            setPosition({ coordinates: [-95, 40], zoom: newZoomLevel });
        } else if (stateViewSettings[selectedState]) {
            const { center } = stateViewSettings[selectedState];
            setPosition({ coordinates: center, zoom: stateViewSettings[selectedState].zoom * newZoomLevel });
        }
    }, [userZoomLevel, selectedState]);

    const handleResetZoom = useCallback(() => {
        setUserZoomLevel(1);
        if (selectedState === "All States") {
            setPosition({ coordinates: [-95, 40], zoom: 1 });
        } else if (stateViewSettings[selectedState]) {
            const { center, zoom } = stateViewSettings[selectedState];
            setPosition({ coordinates: center, zoom });
        }
    }, [selectedState]);

    const handleMouseEnter = useCallback(
        (geo, countyFIPS) => {
            let mounted = true;
            let localCountyFIPS = countyFIPS;
            if (!localCountyFIPS && geo.properties) {
                if (geo.properties.GEOID) {
                    localCountyFIPS = geo.properties.GEOID;
                } else if (geo.properties.id) {
                    localCountyFIPS = geo.properties.id;
                } else if (geo.properties.fips) {
                    localCountyFIPS = geo.properties.fips;
                }
            }
            const countyName = geo.properties?.name || "Unknown County";
            const stateFIPS = localCountyFIPS?.substring(0, 2);
            const stateName = stateFIPS ? stateCodesData[stateFIPS] || "Unknown State" : "Unknown State";
            const lookupFIPS = localCountyFIPS;
            const { countyData, usedKey } = findCountyData(
                mapData.counties,
                lookupFIPS,
                selectedState !== "All States"
            );
            if (!countyData) {
                const mockCountyData = {
                    hasData: false,
                    name: countyName
                };
                const tooltipHtml = CountyTooltipContent({
                    countyData: mockCountyData,
                    countyFIPS: localCountyFIPS,
                    viewMode,
                    selectedCommodities,
                    selectedPrograms,
                    classes,
                    showMeanValues,
                    yearAggregation,
                    selectedYears
                });
                if (mounted) {
                    onTooltipChange(tooltipHtml);
                }
                return;
            }
            const tooltipHtml = CountyTooltipContent({
                countyData,
                countyFIPS: localCountyFIPS,
                viewMode,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                yearAggregation,
                selectedYears
            });
            if (mounted) {
                onTooltipChange(tooltipHtml);
            }
            return () => {
                mounted = false;
            };
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
            selectedState,
            stateCodesData
        ]
    );
    const handleMouseLeave = useCallback(() => {
        onTooltipChange("");
    }, [onTooltipChange]);
    const handleCloseStateView = useCallback(() => {
        setSelectedState("All States");
        setUserZoomLevel(1);
        setPosition({ coordinates: [-95, 40], zoom: 1 });
    }, [setSelectedState]);
    const handleMoveEnd = useCallback(
        (positionObj) => {
            let mounted = true;
            if (selectedState === "All States") {
                if (positionObj.coordinates[0] !== -95 || positionObj.coordinates[1] !== 40) {
                    setPosition({ coordinates: [-95, 40], zoom: positionObj.zoom });
                }
            } else if (stateViewSettings[selectedState]) {
                const { center } = stateViewSettings[selectedState];
                if (positionObj.coordinates[0] !== center[0] || positionObj.coordinates[1] !== center[1]) {
                    setPosition({ coordinates: center, zoom: positionObj.zoom });
                }
            }
            return () => {
                mounted = false;
            };
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
                    valueToUse = countyData.meanRateDifference || 0;
                } else {
                    valueToUse = countyData.meanPaymentRateInDollarsPerAcre;
                    if ((valueToUse === undefined || valueToUse === 0) && selectedPrograms.length === 1) {
                        const programName = selectedPrograms[0];
                        if (countyData.programs && countyData.programs[programName]) {
                            valueToUse =
                                viewMode === "proposed"
                                    ? countyData.programs[programName].proposedMeanRate
                                    : countyData.programs[programName].currentMeanRate;
                        }
                    }
                }
            } else {
                valueToUse = countyData.value || 0;
            }
            if (valueToUse === undefined || valueToUse === null || !isFinite(valueToUse) || valueToUse < 0.01) {
                return "#EEE";
            }
            return colorScale(valueToUse);
        },
        [showMeanValues, selectedPrograms, viewMode, colorScale]
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
                            return false;
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
                            <Geographies geography={geoCountyUrl}>
                                {({ geographies }) => {
                                    return (
                                        <>
                                            {geographies.map((geo) => {
                                                const countyFIPS = geo.id;
                                                if (!countyFIPS) return null;
                                                const stateId = countyFIPS.substring(0, 2);
                                                if (selectedState !== "All States") {
                                                    const stateName = stateCodesData[stateId];
                                                    if (stateName !== selectedState) {
                                                        return null;
                                                    }
                                                    const lookupFIPS = countyFIPS;
                                                    const { countyData, usedKey } = findCountyData(
                                                        mapData.counties,
                                                        lookupFIPS,
                                                        selectedState !== "All States"
                                                    );
                                                    let fillColor;
                                                    if (!countyData) {
                                                        fillColor = "#d9d9d9";
                                                    } else if (countyData.hasData === false) {
                                                        fillColor = "#d9d9d9";
                                                    } else {
                                                        fillColor = getCountyFillColor(countyData);
                                                    }
                                                    return (
                                                        <Geography
                                                            key={geo.rsmKey}
                                                            geography={geo}
                                                            onMouseEnter={() => handleMouseEnter(geo, countyFIPS)}
                                                            onMouseLeave={handleMouseLeave}
                                                            fill={fillColor}
                                                            stroke="#FFFFFF"
                                                            strokeWidth={0.15}
                                                            style={{
                                                                default: { outline: "none", pointerEvents: "auto" },
                                                                hover: {
                                                                    stroke: "#232323",
                                                                    strokeWidth: 0.5,
                                                                    outline: "none",
                                                                    pointerEvents: "auto"
                                                                },
                                                                pressed: {
                                                                    outline: "none",
                                                                    stroke: "#FFFFFF",
                                                                    strokeWidth: 0.15,
                                                                    pointerEvents: "auto"
                                                                }
                                                            }}
                                                        />
                                                    );
                                                }
                                                const { countyData } = findCountyData(mapData.counties, countyFIPS);
                                                let fillColor;
                                                if (!countyData) {
                                                    fillColor = "#d9d9d9";
                                                } else if (countyData.hasData === false) {
                                                    fillColor = "#d9d9d9";
                                                } else {
                                                    fillColor = getCountyFillColor(countyData);
                                                }
                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        onMouseEnter={() => handleMouseEnter(geo, countyFIPS)}
                                                        onMouseLeave={handleMouseLeave}
                                                        fill={fillColor}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={0.15}
                                                        style={{
                                                            default: { outline: "none", pointerEvents: "auto" },
                                                            hover: {
                                                                stroke: "#232323",
                                                                strokeWidth: 0.5,
                                                                outline: "none",
                                                                pointerEvents: "auto"
                                                            },
                                                            pressed: {
                                                                outline: "none",
                                                                stroke: "#FFFFFF",
                                                                strokeWidth: 0.15,
                                                                pointerEvents: "auto"
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                            <Geographies geography={geoStateUrl}>
                                                {({ geographies: stateGeographies }) =>
                                                    stateGeographies.map((geo) => (
                                                        <Geography
                                                            key={`state-${geo.rsmKey}`}
                                                            geography={geo}
                                                            fill="none"
                                                            stroke="#000"
                                                            strokeWidth={0.5}
                                                            style={{
                                                                default: { outline: "none", pointerEvents: "none" },
                                                                hover: { outline: "none", pointerEvents: "none" },
                                                                pressed: { outline: "none", pointerEvents: "none" }
                                                            }}
                                                        />
                                                    ))
                                                }
                                            </Geographies>
                                            {selectedState === "All States" && (
                                                <Geographies geography={geoStateUrl}>
                                                    {({ geographies: labelGeographies }) =>
                                                        labelGeographies.map((geo) => {
                                                            const centroid = geoCentroid(geo);
                                                            const cur = allStates.find((s) => s.val === geo.id);
                                                            if (!cur || centroid[0] < -160 || centroid[0] > -67) {
                                                                return null;
                                                            }
                                                            return (
                                                                <g key={`${geo.rsmKey}-name`}>
                                                                    <Marker coordinates={centroid}>
                                                                        <rect
                                                                            x="-10"
                                                                            y="-6"
                                                                            width="20"
                                                                            height="14"
                                                                            fill="white"
                                                                            opacity="0.7"
                                                                            style={{ pointerEvents: "none" }}
                                                                        />
                                                                        <text
                                                                            y="2"
                                                                            fontSize={12}
                                                                            textAnchor="middle"
                                                                            fill="#555"
                                                                            style={{
                                                                                fontWeight: "bold",
                                                                                pointerEvents: "none"
                                                                            }}
                                                                        >
                                                                            {cur.id}
                                                                        </text>
                                                                    </Marker>
                                                                </g>
                                                            );
                                                        })
                                                    }
                                                </Geographies>
                                            )}
                                        </>
                                    );
                                }}
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
