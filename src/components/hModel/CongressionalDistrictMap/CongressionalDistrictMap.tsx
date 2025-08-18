import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, CircularProgress, Button } from "@mui/material";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import ReactTooltip from "react-tooltip";
import * as d3 from "d3";
import CloseIcon from "@mui/icons-material/Close";
import { CongressionalDistrictTooltipContentHTML } from "./CongressionalDistrictTooltipContent";
import { useStyles, tooltipBkgColor } from "../../shared/MapTooltip";
import congressionalDistrictsTopojson from "../../../data/congressional-districts-topojson";

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

const findDistrictData = (districts, districtId) => {
    if (!districtId || !districts) return { districtData: null, usedKey: null };
    const districtData = districts[districtId];
    const usedKey = districtId;
    if (districtData) {
        let hasRealData = false;
        if (districtData.value && parseFloat(districtData.value) > 0) {
            hasRealData = true;
        } else if (districtData.commodities && Object.keys(districtData.commodities).length > 0) {
            Object.values(districtData.commodities).forEach((commodity: any) => {
                if (commodity.value && parseFloat(commodity.value) > 0) {
                    hasRealData = true;
                }
            });
        }
        if (!hasRealData) {
            districtData.hasData = false;
        }
    }
    return { districtData, usedKey };
};

const CongressionalDistrictMap = ({
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
    const colorScale = d3
        .scaleThreshold()
        .domain(mapData.thresholds || [])
        .range(mapColor);
    const [position, setPosition] = useState({ coordinates: [-95, 40], zoom: 1 });
    const [userZoomLevel, setUserZoomLevel] = useState(1);
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const handleDoubleClick = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".congressional-district-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        const handleWheel = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".congressional-district-map")) {
                if (e.ctrlKey || e.metaKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.deltaZ !== 0) {
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
            }
            return undefined;
        };
        const handleDrag = (e: any): boolean | undefined => {
            if (e.target?.closest?.(".congressional-district-map")) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            }
            return undefined;
        };
        const handleClick = (e: any): boolean | undefined => {
            if (
                e.target?.closest?.(".congressional-district-map") &&
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
                e.target?.closest?.(".congressional-district-map") &&
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

    const handleMoveEnd = useCallback((newPosition: { coordinates: [number, number]; zoom: number }) => {
        if (mountedRef.current) {
            setPosition(newPosition);
            setUserZoomLevel(newPosition.zoom);
        }
    }, []);

    const handleStateZoom = useCallback((stateName: string) => {
        const stateSettings = stateViewSettings[stateName as keyof typeof stateViewSettings];
        if (stateSettings) {
            setPosition({
                coordinates: stateSettings.center as [number, number],
                zoom: stateSettings.zoom
            });
            setUserZoomLevel(stateSettings.zoom);
        }
    }, []);

    useEffect(() => {
        if (selectedState === "All States") {
            setPosition({ coordinates: [-95, 40], zoom: 1 });
            setUserZoomLevel(1);
        } else if (stateViewSettings[selectedState]) {
            const { center, zoom } = stateViewSettings[selectedState];
            setPosition({ coordinates: center, zoom });
            setUserZoomLevel(zoom);
        }
    }, [selectedState]);

    const handleZoomOut = useCallback(() => {
        setPosition({ coordinates: [-95, 40], zoom: 1 });
        setUserZoomLevel(1);
    }, []);

    const handleGeographyClick = useCallback(
        (geo: any) => {
            const stateName = geo.properties.NAMELSAD;
            const stateCode = geo.properties.STATEFP;

            if (selectedState === "All States") {
                const fullStateName = stateCodesData[stateCode] || stateName;
                setSelectedState(fullStateName);
                handleStateZoom(fullStateName);
            }
        },
        [selectedState, stateCodesData, setSelectedState, handleStateZoom]
    );

    const handleGeographyMouseEnter = useCallback(
        (geo: any, event: any) => {
            const districtId = geo.properties.GEOID;
            const { districtData } = findDistrictData(mapData.districts, districtId);

            if (!districtData) {
                const mockDistrictData = {
                    hasData: false,
                    name: geo.properties.NAMELSAD
                };
                const tooltipHtml = CongressionalDistrictTooltipContentHTML({
                    districtData: mockDistrictData,
                    districtName: geo.properties.NAMELSAD,
                    viewMode,
                    selectedCommodities,
                    selectedPrograms,
                    classes,
                    showMeanValues,
                    yearAggregation,
                    selectedYears
                });
                onTooltipChange(tooltipHtml);
                return;
            }

            const tooltipHtml = CongressionalDistrictTooltipContentHTML({
                districtData,
                districtName: geo.properties.NAMELSAD,
                viewMode,
                selectedCommodities,
                selectedPrograms,
                classes,
                showMeanValues,
                yearAggregation,
                selectedYears
            });
            onTooltipChange(tooltipHtml);
        },
        [
            mapData.districts,
            onTooltipChange,
            viewMode,
            selectedCommodities,
            selectedPrograms,
            classes,
            showMeanValues,
            yearAggregation,
            selectedYears
        ]
    );

    const handleGeographyMouseLeave = useCallback(() => {
        ReactTooltip.hide();
    }, []);

    if (isLoading || !mapData.districts) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="500px">
                <CircularProgress />
            </Box>
        );
    }

    const handleZoomIn = useCallback(() => {
        setPosition((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 8) }));
    }, []);

    const handleZoomOutButton = useCallback(() => {
        setPosition((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.5, 0.5) }));
    }, []);

    const handleResetZoom = useCallback(() => {
        setPosition({ coordinates: [-95, 40], zoom: 1 });
        setUserZoomLevel(1);
    }, []);

    return (
        <Box
            className="congressional-district-map"
            sx={{
                position: "relative",
                transition: "opacity 0.3s ease-in-out",
                opacity: isLoading ? 0.6 : 1
            }}
        >
            {selectedState !== "All States" && (
                <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 2000 }}>
                    <Button
                        onClick={() => {
                            setSelectedState("All States");
                            handleZoomOut();
                        }}
                        aria-label="return to US map"
                        variant="contained"
                        startIcon={<CloseIcon />}
                        sx={{
                            "bgcolor": "rgba(47, 113, 100, 0.9)",
                            "color": "white",
                            "border": "2px solid white",
                            "boxShadow": "0 2px 10px rgba(0,0,0,0.2)",
                            "pointerEvents": "auto",
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
                    }
                }}
            >
                <div
                    data-tip=""
                    data-for="map-tooltip"
                    style={{
                        width: "100%",
                        position: "relative"
                    }}
                >
                    <ComposableMap
                        data-tip=""
                        projection="geoAlbersUsa"
                        style={{
                            width: "100%",
                            height: "100%"
                        }}
                    >
                        <ZoomableGroup
                            center={position.coordinates}
                            zoom={position.zoom}
                            onMoveEnd={handleMoveEnd}
                            minZoom={0.5}
                            maxZoom={8}
                        >
                            <Geographies geography={congressionalDistrictsTopojson}>
                                {({ geographies, projection }) => {
                                    const geoElements = geographies.map((geo) => {
                                        const districtId = geo.properties.GEOID;
                                        const { districtData } = findDistrictData(mapData.districts, districtId);
                                        const fillColor =
                                            districtData && districtData.value > 0
                                                ? colorScale(districtData.value)
                                                : "#EEE";

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fillColor}
                                                stroke="#FFF"
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
                                                onClick={() => handleGeographyClick(geo)}
                                                onMouseEnter={(event) => handleGeographyMouseEnter(geo, event)}
                                                onMouseLeave={handleGeographyMouseLeave}
                                                data-tip=""
                                                data-for="map-tooltip"
                                            />
                                        );
                                    });

                                    const textLabels = geographies
                                        .map((geo) => {
                                            const districtId = geo.properties.GEOID;
                                            const stateCode = districtId ? districtId.slice(0, 2) : null;
                                            const districtNumber = districtId ? districtId.slice(-2) : "??";

                                            // Smart filtering based on zoom and state selection
                                            if (selectedState !== "All States") {
                                                // When a specific state is selected, show all districts for that state
                                                if (stateCode && stateCodesData[stateCode] !== selectedState) {
                                                    return null;
                                                }
                                            } else if (position.zoom < 0.8) {
                                                // When showing all states, only show labels when zoomed in enough
                                                return null;
                                            }

                                            // Get the centroid and project it to screen coordinates
                                            const centroid = geoCentroid(geo);
                                            const projectedCentroid = projection(centroid);

                                            // Skip if projection fails
                                            if (!projectedCentroid) {
                                                return null;
                                            }

                                            // Calculate responsive font size - very small and clean
                                            const fontSize =
                                                selectedState !== "All States"
                                                    ? Math.max(4, Math.min(7, position.zoom * 1.5))
                                                    : Math.max(3, Math.min(6, position.zoom * 1.5));

                                            const displayText = districtNumber === "00" ? "AL" : districtNumber;

                                            return (
                                                <g key={`${geo.rsmKey}-label`}>
                                                    <text
                                                        x={projectedCentroid[0]}
                                                        y={projectedCentroid[1]}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        style={{
                                                            fontSize: `${fontSize}px`,
                                                            fill: "#000000",
                                                            fontWeight: "normal",
                                                            pointerEvents: "none",
                                                            opacity: 1,
                                                            fontFamily: "Arial, sans-serif"
                                                        }}
                                                    >
                                                        {displayText}
                                                    </text>
                                                </g>
                                            );
                                        })
                                        .filter(Boolean);

                                    return [...geoElements, ...textLabels];
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
                        onClick={handleZoomOutButton}
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

export default CongressionalDistrictMap;
